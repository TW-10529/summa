# app/api/v1/users.py - COMPLETE FIXED VERSION WITH DEBUGGING
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime
from app import models, schemas
from app.database import get_db
from app.auth_utils import get_password_hash
from app.api.v1.auth import get_current_active_user, get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@router.get("/debug/{user_id}")
def debug_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Debug endpoint to check user data"""
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
        "division_id": user.division_id,
        "department_id": user.department_id,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

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

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        if current_user.role == models.Role.ADMIN:
            pass  # Admin can see anyone
        elif current_user.role == models.Role.DIVISION_MANAGER:
            if user.division_id != current_user.division_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        elif current_user.role == models.Role.DEPARTMENT_MANAGER:
            if user.department_id != current_user.department_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        elif current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own profile"
            )
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
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
        print(f"🆕 CREATE USER: {user.dict()}")
        
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
        
        print(f"✅ Creating user: {db_user.username} with role {db_user.role}")
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating user: {str(e)}")
        import traceback
        traceback.print_exc()
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
    print("\n" + "="*50)
    print(f"🔄 UPDATE USER API CALLED")
    print(f"📋 User ID: {user_id}")
    print(f"👤 Current user: {current_user.username} ({current_user.role})")
    print(f"📝 Update data received: {json.dumps(user_update.dict(), default=str, indent=2)}")
    print("="*50 + "\n")
    
    try:
        # Find user
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        print(f"📊 Found user: {db_user.username}")
        print(f"📊 Current state - Role: {db_user.role}, Division: {db_user.division_id}, Department: {db_user.department_id}")
        
        # Check permissions
        if current_user.role == models.Role.ADMIN:
            print("✅ Admin permissions: OK")
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
        
        # Get update data
        update_data = user_update.dict(exclude_unset=True)
        print(f"📝 Update data to process: {json.dumps(update_data, default=str, indent=2)}")
        
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
        
        # Track role change
        old_role = db_user.role
        new_role = update_data.get('role')
        
        if new_role:
            print(f"🔀 Role change detected: {old_role} -> {new_role}")
            
            # If changing TO division_manager or admin, clear department
            if new_role in [models.Role.DIVISION_MANAGER, models.Role.ADMIN]:
                print(f"🧹 Clearing department for new role: {new_role}")
                # Explicitly clear department_id
                update_data['department_id'] = None
                # Also ensure it's None in the database
                db_user.department_id = None
            
            # If changing FROM department_manager to something else
            if old_role == models.Role.DEPARTMENT_MANAGER and new_role != models.Role.DEPARTMENT_MANAGER:
                print(f"🔓 Removing department manager assignment")
                # Find and clear manager assignment
                department = db.query(models.Department).filter(
                    models.Department.manager_id == user_id
                ).first()
                if department:
                    department.manager_id = None
                    print(f"✅ Removed manager from department: {department.name}")
        
        # Apply updates field by field
        print("\n📋 Applying updates:")
        for field, value in update_data.items():
            print(f"   • {field}: {getattr(db_user, field, 'Not set')} -> {value}")
            setattr(db_user, field, value)
        
        # Final verification for division managers
        if db_user.role == models.Role.DIVISION_MANAGER:
            print(f"🔒 Verifying division manager has no department")
            if db_user.department_id is not None:
                print(f"⚠️ Division manager had department {db_user.department_id}, fixing...")
                db_user.department_id = None
        
        print(f"\n📊 Before commit - Final state:")
        print(f"   • Role: {db_user.role}")
        print(f"   • Division ID: {db_user.division_id}")
        print(f"   • Department ID: {db_user.department_id}")
        print(f"   • Email: {db_user.email}")
        print(f"   • Full Name: {db_user.full_name}")
        
        db.commit()
        db.refresh(db_user)
        
        print(f"\n✅ User {user_id} updated successfully")
        print(f"📊 After commit - Final state:")
        print(f"   • Role: {db_user.role}")
        print(f"   • Division ID: {db_user.division_id}")
        print(f"   • Department ID: {db_user.department_id}")
        
        print("\n" + "="*50)
        print("✅ UPDATE COMPLETE")
        print("="*50 + "\n")
        
        return db_user
        
    except HTTPException as he:
        print(f"❌ HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

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
    
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is a department manager
        if db_user.role == models.Role.DEPARTMENT_MANAGER:
            # Remove manager from department
            department = db.query(models.Department).filter(
                models.Department.manager_id == user_id
            ).first()
            if department:
                department.manager_id = None
        
        # Check if user is a division manager
        if db_user.role == models.Role.DIVISION_MANAGER:
            # Note: Division manager assignment is handled in divisions endpoint
            pass
        
        # Delete user
        db.delete(db_user)
        db.commit()
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )