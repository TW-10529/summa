from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.DivisionResponse])
def read_divisions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if current_user.role == models.Role.ADMIN:
        divisions = db.query(models.Division).all()
    elif current_user.role == models.Role.DIVISION_MANAGER:
        divisions = db.query(models.Division).filter(
            models.Division.id == current_user.division_id
        ).all()
    else:
        if current_user.division_id:
            divisions = db.query(models.Division).filter(
                models.Division.id == current_user.division_id
            ).all()
        else:
            divisions = []
    return [schemas.DivisionResponse.from_orm(div) for div in divisions]

@router.get("/{division_id}", response_model=schemas.DivisionResponse)
def read_division(
    division_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    division = db.query(models.Division).filter(models.Division.id == division_id).first()
    if not division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found"
        )
    
    # Check permissions
    if current_user.role == models.Role.ADMIN:
        pass
    elif current_user.role == models.Role.DIVISION_MANAGER:
        if division.id != current_user.division_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    elif division.id != current_user.division_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return schemas.DivisionResponse.from_orm(division)

@router.post("/", response_model=schemas.DivisionResponse)
def create_division(
    division: schemas.DivisionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can create divisions
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if division already exists
    existing_division = db.query(models.Division).filter(
        models.Division.name == division.name
    ).first()
    
    if existing_division:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Division already exists"
        )
    
    db_division = models.Division(**division.dict())
    db.add(db_division)
    db.commit()
    db.refresh(db_division)
    
    return schemas.DivisionResponse.from_orm(db_division)

@router.put("/{division_id}", response_model=schemas.DivisionResponse)
def update_division(
    division_id: int,
    division_update: schemas.DivisionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can update divisions
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_division = db.query(models.Division).filter(models.Division.id == division_id).first()
    if not db_division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found"
        )
    
    # Check if name is being changed and if new name already exists
    if division_update.name != db_division.name:
        existing_division = db.query(models.Division).filter(
            models.Division.name == division_update.name,
            models.Division.id != division_id
        ).first()
        if existing_division:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Division name already exists"
            )
    
    # Update division
    for field, value in division_update.dict().items():
        setattr(db_division, field, value)
    
    db.commit()
    db.refresh(db_division)
    
    return schemas.DivisionResponse.from_orm(db_division)

@router.delete("/{division_id}")
def delete_division(
    division_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can delete divisions
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_division = db.query(models.Division).filter(models.Division.id == division_id).first()
    if not db_division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found"
        )
    
    # Check if division has departments
    department_count = db.query(models.Department).filter(
        models.Department.division_id == division_id
    ).count()
    
    if department_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete division with {department_count} department(s). Delete departments first."
        )
    
    # Check if division has users
    user_count = db.query(models.User).filter(
        models.User.division_id == division_id
    ).count()
    
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete division with {user_count} user(s). Reassign users first."
        )
    
    # Delete division
    db.delete(db_division)
    db.commit()
    
    return {"message": "Division deleted successfully"}

@router.put("/{division_id}/manager")
def assign_division_manager(
    division_id: int,
    manager_data: schemas.ManagerAssignment,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can assign division managers
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if division exists
    division = db.query(models.Division).filter(models.Division.id == division_id).first()
    if not division:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found"
        )
    
    # If manager_id is None, we're removing the manager
    if manager_data.manager_id is None:
        # Remove division manager role from current manager if exists
        current_managers = db.query(models.User).filter(
            models.User.division_id == division_id,
            models.User.role == models.Role.DIVISION_MANAGER
        ).all()
        
        for manager in current_managers:
            manager.role = models.Role.EMPLOYEE
            manager.division_id = None
        
        db.commit()
        return {"message": "Division manager removed successfully"}
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == manager_data.manager_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Remove division manager role from current manager if exists
    current_manager = db.query(models.User).filter(
        models.User.division_id == division_id,
        models.User.role == models.Role.DIVISION_MANAGER
    ).first()
    
    if current_manager and current_manager.id != user.id:
        current_manager.role = models.Role.EMPLOYEE
    
    # Update user role and division assignment
    user.role = models.Role.DIVISION_MANAGER
    user.division_id = division_id
    user.department_id = None  # Remove from any department
    
    db.commit()
    
    return {"message": "Division manager assigned successfully"}