# schemas.py - UPDATED WITH NOTIFICATION SCHEMAS
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
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
    
    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employee_id: Optional[str] = None
    division_id: Optional[int] = None
    department_id: Optional[int] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    
    model_config = ConfigDict(from_attributes=True)

# Division Schemas
class DivisionBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "blue"
    
    model_config = ConfigDict(from_attributes=True)

class DivisionCreate(DivisionBase):
    pass

class DivisionResponse(DivisionBase):
    id: int
    created_at: datetime

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    division_id: int
    manager_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime

# Manager Assignment Schema
class ManagerAssignment(BaseModel):
    manager_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    
    model_config = ConfigDict(from_attributes=True)

class NotificationCreate(NotificationBase):
    target: str = "all"  # all, division_managers, department_managers, employees, specific
    target_ids: Optional[List[int]] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    read: bool
    read_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Settings Schemas
class SettingsBase(BaseModel):
    key: str
    value: Optional[Any] = None
    category: str
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class SettingsCreate(SettingsBase):
    pass

class SettingsUpdate(BaseModel):
    value: Optional[Any] = None
    
    model_config = ConfigDict(from_attributes=True)

class SettingsResponse(SettingsBase):
    id: int
    updated_at: Optional[datetime] = None
    updated_by: Optional[int] = None

# Audit Log Schemas
class AuditLogBase(BaseModel):
    action: str
    resource: str
    resource_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    user: Optional[UserResponse] = None

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_divisions: int
    total_departments: int
    total_employees: int
    today_attendance: float
    active_shifts: int
    pending_approvals: int
    
    model_config = ConfigDict(from_attributes=True)

# System Backup Schema
class BackupRequest(BaseModel):
    include_data: bool = True
    include_logs: bool = False
    backup_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class BackupResponse(BaseModel):
    backup_id: str
    filename: str
    size: str
    created_at: datetime
    download_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)