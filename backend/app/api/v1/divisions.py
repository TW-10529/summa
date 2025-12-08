# app/api/v1/divisions.py - COMPLETE AND CORRECTED
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError
import traceback
from datetime import datetime  # FIXED: Remove the .datetime

from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

@router.get("/health")
def health_check():
    """Simple health check endpoint (no auth, no db)"""
    return {
        "status": "healthy",
        "message": "Divisions router is working",
        "timestamp": datetime.now().isoformat()  # FIXED: Just datetime.now()
    }
@router.get("/", response_model=List[schemas.DivisionResponse])
def read_divisions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        print(f"🔍 GET /divisions called by {current_user.username} ({current_user.role})")
        
        if current_user.role == models.Role.ADMIN:
            print("🔍 Admin: Querying all divisions")
            divisions = db.query(models.Division).all()
        elif current_user.role == models.Role.DIVISION_MANAGER:
            if current_user.division_id:
                print(f"🔍 Division Manager: Querying division {current_user.division_id}")
                divisions = db.query(models.Division).filter(
                    models.Division.id == current_user.division_id
                ).all()
            else:
                print("⚠️ Division Manager has no division assigned")
                divisions = []
        else:
            if current_user.division_id:
                print(f"🔍 Employee: Querying division {current_user.division_id}")
                divisions = db.query(models.Division).filter(
                    models.Division.id == current_user.division_id
                ).all()
            else:
                print("⚠️ Employee has no division assigned")
                divisions = []
        
        print(f"✅ Found {len(divisions)} divisions")
        return divisions
    except Exception as e:
        print(f"❌ Error in read_divisions: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching divisions: {str(e)}"
        )

@router.get("/{division_id}", response_model=schemas.DivisionResponse)
def read_division(
    division_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        print(f"🔍 GET /divisions/{division_id} called by {current_user.username}")
        
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
        
        print(f"✅ Returning division: {division.name}")
        return division
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in read_division: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching division: {str(e)}"
        )

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
            detail="Not enough permissions. Only admin can create divisions."
        )
    
    try:
        print(f"🔍 POST /divisions called by {current_user.username}")
        print(f"📝 Division data: {division.dict()}")
        
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
        
        print(f"✅ Division created: {db_division.name} (ID: {db_division.id})")
        return db_division
    except IntegrityError:
        db.rollback()
        print("❌ Integrity error - division name must be unique")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Division name must be unique"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating division: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating division: {str(e)}"
        )

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
            detail="Not enough permissions. Only admin can update divisions."
        )
    
    try:
        print(f"🔍 PUT /divisions/{division_id} called by {current_user.username}")
        
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
        update_data = division_update.dict()
        for field, value in update_data.items():
            setattr(db_division, field, value)
        
        db.commit()
        db.refresh(db_division)
        
        print(f"✅ Division updated: {db_division.name} (ID: {db_division.id})")
        return db_division
    except IntegrityError:
        db.rollback()
        print("❌ Integrity error - division name must be unique")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Division name must be unique"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating division: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating division: {str(e)}"
        )

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
            detail="Not enough permissions. Only admin can delete divisions."
        )
    
    try:
        print(f"🔍 DELETE /divisions/{division_id} called by {current_user.username}")
        
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
        
        print(f"✅ Division deleted: ID {division_id}")
        return {"message": "Division deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting division: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting division: {str(e)}"
        )

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
            detail="Not enough permissions. Only admin can assign division managers."
        )
    
    try:
        print(f"🔍 PUT /divisions/{division_id}/manager called by {current_user.username}")
        print(f"📝 Manager data: {manager_data.dict()}")
        
        # Check if division exists
        division = db.query(models.Division).filter(models.Division.id == division_id).first()
        if not division:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Division not found"
            )
        
        # If manager_id is None, we're removing the manager
        if manager_data.manager_id is None:
            print("🔄 Removing division manager")
            # Remove division manager role from current manager if exists
            current_managers = db.query(models.User).filter(
                models.User.division_id == division_id,
                models.User.role == models.Role.DIVISION_MANAGER
            ).all()
            
            for manager in current_managers:
                manager.role = models.Role.EMPLOYEE
                manager.division_id = None
            
            db.commit()
            print("✅ Division manager removed")
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
        
        print(f"✅ Division manager assigned: {user.username} to division {division.name}")
        return {"message": "Division manager assigned successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error assigning division manager: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning division manager: {str(e)}"
        )