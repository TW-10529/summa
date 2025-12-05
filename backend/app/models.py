from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum, Text, ForeignKeyConstraint
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

# Simple models for Phase 1 & 2
class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Morning, Afternoon, Night
    start_time = Column(String, nullable=False)  # "08:00"
    end_time = Column(String, nullable=False)    # "16:00"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())