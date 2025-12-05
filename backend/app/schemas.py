from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    division_manager = "division_manager"
    department_manager = "department_manager"
    employee = "employee"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    employee_id: Optional[str] = None
    role: RoleEnum = RoleEnum.employee
    division_id: Optional[int] = None
    department_id: Optional[int] = None
    
    class Config:
        orm_mode = True  # For Pydantic v1

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employee_id: Optional[str] = None
    division_id: Optional[int] = None
    department_id: Optional[int] = None
    avatar_url: Optional[str] = None
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str
    
    class Config:
        orm_mode = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    
    class Config:
        orm_mode = True

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    
    class Config:
        orm_mode = True

# Division Schemas
class DivisionBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "blue"
    
    class Config:
        orm_mode = True

class DivisionCreate(DivisionBase):
    pass

class DivisionResponse(DivisionBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    division_id: int
    manager_id: Optional[int] = None
    
    class Config:
        orm_mode = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Manager Assignment Schema - ADD THIS
class ManagerAssignment(BaseModel):
    manager_id: Optional[int] = None
    
    class Config:
        orm_mode = True