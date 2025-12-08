# app/models.py - COMPLETE VERSION WITH NOTIFICATION MODEL
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.database import Base

class Role(str, enum.Enum):
    ADMIN = "admin"
    DIVISION_MANAGER = "division_manager"
    DEPARTMENT_MANAGER = "department_manager"
    EMPLOYEE = "employee"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, index=True)
    role = Column(Enum(Role), default=Role.EMPLOYEE, nullable=False)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", use_alter=True, name="fk_user_department"), nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships with explicit foreign_keys
    division = relationship("Division", back_populates="users")
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    
    # Backref for managed department (only for department managers)
    managed_department = relationship("Department", back_populates="manager", foreign_keys="Department.manager_id", uselist=False)
    
    # Notifications relationship
    notifications = relationship("Notification", back_populates="user", foreign_keys="Notification.user_id", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"

class Division(Base):
    __tablename__ = "divisions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String, default="blue")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="division")
    departments = relationship("Department", back_populates="division")
    
    def __repr__(self):
        return f"<Division {self.name}>"

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id", use_alter=True, name="fk_department_manager"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships with explicit foreign_keys
    division = relationship("Division", back_populates="departments")
    manager = relationship("User", back_populates="managed_department", foreign_keys=[manager_id])
    employees = relationship("User", back_populates="department", foreign_keys="User.department_id")
    
    def __repr__(self):
        return f"<Department {self.name}>"

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Morning, Afternoon, Night
    start_time = Column(String, nullable=False)  # "08:00"
    end_time = Column(String, nullable=False)    # "16:00"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Notification Model
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, alert, success
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    sender = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<Notification {self.title} for user {self.user_id}>"

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=True)
    category = Column(String, index=True, nullable=False)  # general, security, notifications, users, system
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def __repr__(self):
        return f"<SystemSettings {self.key}>"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # create, update, delete, login, etc.
    resource = Column(String, nullable=False)  # user, division, department, settings
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.action} {self.resource}>"