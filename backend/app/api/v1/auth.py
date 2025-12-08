# app/api/v1/auth.py - UPDATED WITH DEBUGGING
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from app import models, schemas
from app.database import get_db
from app.auth_utils import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, verify_token
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class RefreshTokenRequest(BaseModel):
    refresh_token: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print(f"🔐 get_current_user called with token: {token[:30]}...")
    
    if not token:
        print("❌ No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = verify_token(token)
        if not payload:
            print("❌ Token verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if payload.get("type") != "access":
            print(f"❌ Wrong token type: {payload.get('type')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("user_id")
        if not user_id:
            print("❌ No user_id in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"🔍 Looking for user with ID: {user_id}")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not user:
            print(f"❌ User not found with ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            print(f"❌ User is inactive: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"✅ Authentication successful for user: {user.username}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in get_current_user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"🔑 Login attempt for username: {form_data.username}")
    
    # Try username first, then email
    user = db.query(models.User).filter(
        (models.User.username == form_data.username)
    ).first()
    
    if not user:
        user = db.query(models.User).filter(
            (models.User.email == form_data.username)
        ).first()
        print(f"🔍 Trying email lookup: {form_data.username}")

    if not user:
        print(f"❌ User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    print(f"✅ User found: {user.username}")
    print(f"🔍 Checking password...")
    
    from app.auth_utils import verify_password
    if not verify_password(form_data.password, user.password_hash):
        print(f"❌ Incorrect password for user: {user.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user.is_active:
        print(f"❌ User is inactive: {user.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"user_id": user.id, "username": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"user_id": user.id, "username": user.username}
    )

    user_response = schemas.UserResponse.model_validate(user)

    print(f"✅ Login successful for user: {user.username}")
    print(f"📝 Access token created (first 30 chars): {access_token[:30]}...")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh_token_endpoint(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    print("🔄 Refresh token endpoint called")
    
    if not request.refresh_token:
        print("❌ No refresh token provided")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )
    
    payload = verify_token(request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        print(f"❌ Invalid refresh token. Payload: {payload}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("user_id")
    if not user_id:
        print("❌ No user_id in refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user or not user.is_active:
        print(f"❌ User not found or inactive: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    new_access_token = create_access_token(
        data={"user_id": user.id, "username": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )

    new_refresh_token = create_refresh_token(
        data={"user_id": user.id, "username": user.username}
    )

    user_response = schemas.UserResponse.model_validate(user)

    print(f"✅ Token refreshed for user: {user.username}")
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    print(f"📊 /me endpoint called for user: {current_user.username}")
    return current_user

# Test endpoint to verify authentication
@router.get("/test-auth")
def test_auth(current_user: models.User = Depends(get_current_active_user)):
    print(f"🧪 Test auth endpoint called for user: {current_user.username}")
    return {
        "message": "Authentication successful",
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role.value
    }