from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db
from app.auth import get_current_active_user, get_password_hash

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_active_user)):
    return schemas.UserResponse.from_orm(current_user)

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
    # Apply role-based filtering
    query = db.query(models.User)
    
    # Admin can see all users
    if current_user.role == models.Role.ADMIN:
        pass
    # Division manager can see users in their division
    elif current_user.role == models.Role.DIVISION_MANAGER:
        query = query.filter(models.User.division_id == current_user.division_id)
    # Department manager can see users in their department
    elif current_user.role == models.Role.DEPARTMENT_MANAGER:
        query = query.filter(models.User.department_id == current_user.department_id)
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
        query = query.filter(
            (models.User.full_name.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%")) |
            (models.User.employee_id.ilike(f"%{search}%"))
        )
    
    users = query.offset(skip).limit(limit).all()
    return [schemas.UserResponse.from_orm(user) for user in users]

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a user (hard delete - removes from database)
    Only admins can delete users, and cannot delete themselves
    """
    print(f"DELETE request for user_id: {user_id}")  # Debug log
    
    # Only admin can delete users
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Cannot delete yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    # Find user
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        # Delete the user
        db.delete(db_user)
        db.commit()
        return {"message": "User deleted successfully", "user_id": user_id}
    except Exception as e:
        db.rollback()
        print(f"Error deleting user: {e}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
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
            detail="Not enough permissions"
        )
    
    # Check if email or username already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
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
        department_id=user.department_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return schemas.UserResponse.from_orm(db_user)

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
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
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    return schemas.UserResponse.from_orm(db_user)