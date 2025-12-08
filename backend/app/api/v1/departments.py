# app/api/v1/departments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.DepartmentResponse])
def read_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    division_id: Optional[int] = None
):
    try:
        query = db.query(models.Department)
        
        # Apply role-based filtering
        if current_user.role == models.Role.ADMIN:
            pass
        elif current_user.role == models.Role.DIVISION_MANAGER:
            query = query.filter(models.Department.division_id == current_user.division_id)
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            query = query.filter(models.Department.id == current_user.department_id)
        else:
            if current_user.department_id:
                query = query.filter(models.Department.id == current_user.department_id)
            else:
                query = query.filter(False)  # Return empty
        
        if division_id:
            query = query.filter(models.Department.division_id == division_id)
        
        departments = query.all()
        return departments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching departments: {str(e)}"
        )

@router.get("/{department_id}", response_model=schemas.DepartmentResponse)
def read_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Check permissions
        if current_user.role == models.Role.ADMIN:
            pass
        elif current_user.role == models.Role.DIVISION_MANAGER:
            if department.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            if department.id != current_user.department_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        elif department.id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        return department
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching department: {str(e)}"
        )

@router.post("/", response_model=schemas.DepartmentResponse)
def create_department(
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin and division managers can create departments
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Division managers can only create departments in their division
    if current_user.role == models.Role.DIVISION_MANAGER:
        if department.division_id != current_user.division_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only create departments in your division"
            )
    
    try:
        # Check if department code already exists
        existing_department = db.query(models.Department).filter(
            models.Department.code == department.code
        ).first()
        
        if existing_department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department code already exists"
            )
        
        # Check if division exists
        division = db.query(models.Division).filter(models.Division.id == department.division_id).first()
        if not division:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Division not found"
            )
        
        db_department = models.Department(**department.dict())
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        
        return db_department
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating department: {str(e)}"
        )

@router.put("/{department_id}", response_model=schemas.DepartmentResponse)
def update_department(
    department_id: int,
    department_update: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check permissions
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not db_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Division manager can only update departments in their division
        if current_user.role == models.Role.DIVISION_MANAGER:
            if db_dept.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Can only update departments in your division"
                )
        
        # Check if code is being changed and if new code already exists
        if department_update.code != db_dept.code:
            existing_dept = db.query(models.Department).filter(
                models.Department.code == department_update.code,
                models.Department.id != department_id
            ).first()
            if existing_dept:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department code already exists"
                )
        
        # Update department
        for field, value in department_update.dict().items():
            setattr(db_dept, field, value)
        
        db.commit()
        db.refresh(db_dept)
        
        return db_dept
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating department: {str(e)}"
        )

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check permissions
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        db_dept = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not db_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Division manager can only delete departments in their division
        if current_user.role == models.Role.DIVISION_MANAGER:
            if db_dept.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Can only delete departments in your division"
                )
        
        # Check if department has employees
        employee_count = db.query(models.User).filter(
            models.User.department_id == department_id
        ).count()
        
        if employee_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete department with {employee_count} employee(s). Reassign employees first."
            )
        
        # Delete department
        db.delete(db_dept)
        db.commit()
        
        return {"message": "Department deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting department: {str(e)}"
        )

@router.put("/{department_id}/manager")
def assign_department_manager(
    department_id: int,
    manager_data: schemas.ManagerAssignment,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check permissions
    if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Check if department exists
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Division manager can only assign managers in their division
        if current_user.role == models.Role.DIVISION_MANAGER:
            if department.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Can only assign managers in your division"
                )
        
        # If manager_id is None, we're removing the manager
        if manager_data.manager_id is None:
            if department.manager_id:
                # Remove department manager role from current manager
                current_manager = db.query(models.User).filter(
                    models.User.id == department.manager_id
                ).first()
                if current_manager:
                    current_manager.role = models.Role.EMPLOYEE
            
            department.manager_id = None
            db.commit()
            return {"message": "Department manager removed successfully"}
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.id == manager_data.manager_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Remove department manager role from current manager if exists
        if department.manager_id and department.manager_id != user.id:
            current_manager = db.query(models.User).filter(
                models.User.id == department.manager_id
            ).first()
            if current_manager:
                current_manager.role = models.Role.EMPLOYEE
        
        # Update user role and department assignment
        user.role = models.Role.DEPARTMENT_MANAGER
        user.department_id = department_id
        user.division_id = department.division_id  # Set to parent division
        
        # Update department manager
        department.manager_id = user.id
        
        db.commit()
        
        return {"message": "Department manager assigned successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning department manager: {str(e)}"
        )