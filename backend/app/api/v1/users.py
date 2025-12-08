# app/api/v1/users.py - UPDATED
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.auth_utils import get_password_hash
from app.api.v1.auth import get_current_active_user, get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    division_id: Optional[int] = None,
    department_id: Optional[int] = None,
    role: Optional[schemas.RoleEnum] = None,
    search: Optional[str] = None
):
    try:
        # Apply role-based filtering
        query = db.query(models.User)
        
        # Admin can see all users
        if current_user.role == models.Role.ADMIN:
            pass
        # Division manager can see users in their division
        elif current_user.role == models.Role.DIVISION_MANAGER:
            if current_user.division_id:
                query = query.filter(models.User.division_id == current_user.division_id)
            else:
                query = query.filter(False)  # No division assigned
        # Department manager can see users in their department
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            if current_user.department_id:
                query = query.filter(models.User.department_id == current_user.department_id)
            else:
                query = query.filter(False)  # No department assigned
        # Employee can only see themselves
        else:
            query = query.filter(models.User.id == current_user.id)
        
        # Apply filters
        if division_id:
            query = query.filter(models.User.division_id == division_id)
        if department_id:
            query = query.filter(models.User.department_id == department_id)
        if role:
            query = query.filter(models.User.role == role)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (models.User.full_name.ilike(search_term)) |
                (models.User.email.ilike(search_term)) |
                (models.User.employee_id.ilike(search_term)) |
                (models.User.username.ilike(search_term))
            )
        
        users = query.offset(skip).limit(limit).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can create users
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can create users."
        )
    
    try:
        # Check if email already exists
        existing_email = db.query(models.User).filter(
            models.User.email == user.email
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_username = db.query(models.User).filter(
            models.User.username == user.username
        ).first()
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Check employee_id if provided
        if user.employee_id:
            existing_employee_id = db.query(models.User).filter(
                models.User.employee_id == user.employee_id
            ).first()
            
            if existing_employee_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Employee ID already exists"
                )
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user
        db_user = models.User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            password_hash=hashed_password,
            employee_id=user.employee_id,
            role=user.role,
            division_id=user.division_id,
            department_id=user.department_id,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        # Find user
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        if current_user.role == models.Role.ADMIN:
            pass  # Admin can update anyone
        elif current_user.role == models.Role.DIVISION_MANAGER:
            if db_user.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Can only update users in your division"
                )
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            if db_user.department_id != current_user.department_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Can only update users in your department"
                )
        elif current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only update your own profile"
            )
        
        # Update user
        update_data = user_update.dict(exclude_unset=True)
        
        # Check email uniqueness if being updated
        if 'email' in update_data and update_data['email'] != db_user.email:
            existing = db.query(models.User).filter(
                models.User.email == update_data['email'],
                models.User.id != user_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

# app/api/v1/users.py - FIXED delete_user function
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Only admin can delete users
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Only admin can delete users."
        )
    
    # Cannot delete yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    try:
        # Find user
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is a department manager
        if db_user.role == models.Role.DEPARTMENT_MANAGER:
            # Remove manager assignment from department
            department = db.query(models.Department).filter(
                models.Department.manager_id == user_id
            ).first()
            if department:
                department.manager_id = None
        
        # Check if user is a division manager
        if db_user.role == models.Role.DIVISION_MANAGER:
            # There's no direct reference, so just delete
            pass
        
        # Delete the user
        db.delete(db_user)
        db.commit()
        
        return {"message": "User deleted successfully", "user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )