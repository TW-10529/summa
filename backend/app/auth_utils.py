# app/auth_utils.py - UPDATED WITH DEBUGGING
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Security - Use environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-change-this-in-production":
    print("⚠️ WARNING: Using default SECRET_KEY. Change this in production!")
    SECRET_KEY = "your-super-secret-key-change-this-in-production-1234567890"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for development
REFRESH_TOKEN_EXPIRE_DAYS = 30

print(f"🔑 Using SECRET_KEY: {SECRET_KEY[:10]}...")
print(f"🔑 Using ALGORITHM: {ALGORITHM}")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow(),
        "iss": "factoryshift-api"
    })
    
    print(f"📝 Creating access token with data: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"✅ Token created (first 50 chars): {encoded_jwt[:50]}...")
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow(),
        "iss": "factoryshift-api"
    })
    
    print(f"📝 Creating refresh token with data: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    if not token:
        print("❌ No token provided")
        return None
    
    print(f"🔍 Verifying token (first 50 chars): {token[:50]}...")
    
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_aud": False,
                "verify_iss": False  # Temporarily disable issuer verification
            }
        )
        print(f"✅ Token verified successfully: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        print("❌ Token has expired")
        return None
    except jwt.JWTError as e:
        print(f"❌ JWT Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error verifying token: {e}")
        return None