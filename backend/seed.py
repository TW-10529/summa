import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash
from sqlalchemy import text

def seed_database():
    db = SessionLocal()
    
    try:
        print("Starting database seeding...")
        
        # Drop tables in correct order to avoid circular dependency
        print("Dropping existing tables...")
        with engine.connect() as conn:
            # Drop tables manually in correct order
            conn.execute(text("DROP TABLE IF EXISTS shifts CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS departments CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS divisions CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS role CASCADE"))
            conn.commit()
        
        # Create all tables
        print("Creating tables...")
        models.Base.metadata.create_all(bind=engine)
        
        # Create admin user
        admin_user = models.User(
            email="admin@factory.com",
            username="admin",
            full_name="Admin User",
            password_hash=get_password_hash("1234"),
            employee_id="ADMIN001",
            role=models.Role.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        print("✓ Admin user created")
        
        # Create sample divisions
        divisions_data = [
            {"name": "Production", "description": "Production Division", "color": "blue"},
            {"name": "Quality Assurance", "description": "Quality Division", "color": "green"},
            {"name": "Maintenance", "description": "Maintenance Division", "color": "orange"},
            {"name": "Logistics", "description": "Logistics Division", "color": "purple"},
        ]
        
        divisions = {}
        for div_data in divisions_data:
            division = models.Division(**div_data)
            db.add(division)
            db.flush()  # Flush to get the ID
            divisions[division.name] = division
            print(f"✓ Division {div_data['name']} created")
        
        # Create sample departments WITHOUT manager_id first
        departments_data = [
            # Production departments
            {"name": "Production Line A", "code": "PROD_A", "division_id": divisions["Production"].id},
            {"name": "Production Line B", "code": "PROD_B", "division_id": divisions["Production"].id},
            {"name": "Production Line C", "code": "PROD_C", "division_id": divisions["Production"].id},
            {"name": "Assembly", "code": "ASSEMBLY", "division_id": divisions["Production"].id},
            
            # Quality departments
            {"name": "QC Incoming", "code": "QC_IN", "division_id": divisions["Quality Assurance"].id},
            {"name": "QC Production", "code": "QC_PROD", "division_id": divisions["Quality Assurance"].id},
            {"name": "QC Final", "code": "QC_FINAL", "division_id": divisions["Quality Assurance"].id},
            
            # Maintenance departments
            {"name": "Mechanical", "code": "MECH", "division_id": divisions["Maintenance"].id},
            {"name": "Electrical", "code": "ELEC", "division_id": divisions["Maintenance"].id},
            {"name": "Preventive", "code": "PREV", "division_id": divisions["Maintenance"].id},
            
            # Logistics departments
            {"name": "Warehouse", "code": "WARE", "division_id": divisions["Logistics"].id},
            {"name": "Shipping", "code": "SHIP", "division_id": divisions["Logistics"].id},
            {"name": "Receiving", "code": "RECV", "division_id": divisions["Logistics"].id},
        ]
        
        departments = {}
        for dept_data in departments_data:
            department = models.Department(**dept_data)
            db.add(department)
            db.flush()  # Flush to get the ID
            departments[department.code] = department
            print(f"✓ Department {dept_data['name']} created")
        
        # Create division managers
        division_managers = [
            {
                "email": "prod_manager@factory.com",
                "username": "prod_manager",
                "full_name": "Production Manager",
                "employee_id": "DIV001",
                "role": models.Role.DIVISION_MANAGER,
                "division_id": divisions["Production"].id,
                "password": "password123"
            },
            {
                "email": "quality_manager@factory.com",
                "username": "quality_manager",
                "full_name": "Quality Manager",
                "employee_id": "DIV002",
                "role": models.Role.DIVISION_MANAGER,
                "division_id": divisions["Quality Assurance"].id,
                "password": "password123"
            },
            {
                "email": "maintenance_manager@factory.com",
                "username": "maintenance_manager",
                "full_name": "Maintenance Manager",
                "employee_id": "DIV003",
                "role": models.Role.DIVISION_MANAGER,
                "division_id": divisions["Maintenance"].id,
                "password": "password123"
            },
            {
                "email": "logistics_manager@factory.com",
                "username": "logistics_manager",
                "full_name": "Logistics Manager",
                "employee_id": "DIV004",
                "role": models.Role.DIVISION_MANAGER,
                "division_id": divisions["Logistics"].id,
                "password": "password123"
            },
        ]
        
        division_manager_users = {}
        for mgr_data in division_managers:
            user = models.User(
                email=mgr_data["email"],
                username=mgr_data["username"],
                full_name=mgr_data["full_name"],
                password_hash=get_password_hash(mgr_data["password"]),
                employee_id=mgr_data["employee_id"],
                role=mgr_data["role"],
                division_id=mgr_data["division_id"],
                is_active=True
            )
            db.add(user)
            db.flush()
            division_manager_users[mgr_data["username"]] = user
            print(f"✓ Division manager {mgr_data['full_name']} created")
        
        # Create department managers
        department_managers = [
            {
                "email": "dept_manager_a@factory.com",
                "username": "dept_manager_a",
                "full_name": "John Smith",
                "employee_id": "DEPT001",
                "role": models.Role.DEPARTMENT_MANAGER,
                "division_id": divisions["Production"].id,
                "department_id": departments["PROD_A"].id,
                "password": "password123"
            },
            {
                "email": "dept_manager_b@factory.com",
                "username": "dept_manager_b",
                "full_name": "Sarah Johnson",
                "employee_id": "DEPT002",
                "role": models.Role.DEPARTMENT_MANAGER,
                "division_id": divisions["Production"].id,
                "department_id": departments["PROD_B"].id,
                "password": "password123"
            },
            {
                "email": "qc_manager@factory.com",
                "username": "qc_manager",
                "full_name": "Jane Doe",
                "employee_id": "DEPT003",
                "role": models.Role.DEPARTMENT_MANAGER,
                "division_id": divisions["Quality Assurance"].id,
                "department_id": departments["QC_IN"].id,
                "password": "password123"
            },
        ]
        
        department_manager_users = {}
        for mgr_data in department_managers:
            user = models.User(
                email=mgr_data["email"],
                username=mgr_data["username"],
                full_name=mgr_data["full_name"],
                password_hash=get_password_hash(mgr_data["password"]),
                employee_id=mgr_data["employee_id"],
                role=mgr_data["role"],
                division_id=mgr_data["division_id"],
                department_id=mgr_data["department_id"],
                is_active=True
            )
            db.add(user)
            db.flush()
            department_manager_users[mgr_data["username"]] = user
            print(f"✓ Department manager {mgr_data['full_name']} created")
        
        # Now assign managers to departments (after users are created)
        departments["PROD_A"].manager_id = department_manager_users["dept_manager_a"].id
        departments["PROD_B"].manager_id = department_manager_users["dept_manager_b"].id
        departments["QC_IN"].manager_id = department_manager_users["qc_manager"].id
        print("✓ Managers assigned to departments")
        
        # Create sample employees
        employees_data = [
            {
                "email": "employee1@factory.com",
                "username": "employee1",
                "full_name": "Robert Chen",
                "employee_id": "EMP001",
                "role": models.Role.EMPLOYEE,
                "division_id": divisions["Production"].id,
                "department_id": departments["PROD_A"].id,
                "password": "password123"
            },
            {
                "email": "employee2@factory.com",
                "username": "employee2",
                "full_name": "Mike Wilson",
                "employee_id": "EMP002",
                "role": models.Role.EMPLOYEE,
                "division_id": divisions["Production"].id,
                "department_id": departments["PROD_A"].id,
                "password": "password123"
            },
            {
                "email": "employee3@factory.com",
                "username": "employee3",
                "full_name": "Lisa Brown",
                "employee_id": "EMP003",
                "role": models.Role.EMPLOYEE,
                "division_id": divisions["Quality Assurance"].id,
                "department_id": departments["QC_IN"].id,
                "password": "password123"
            },
            {
                "email": "employee4@factory.com",
                "username": "employee4",
                "full_name": "David Lee",
                "employee_id": "EMP004",
                "role": models.Role.EMPLOYEE,
                "division_id": divisions["Maintenance"].id,
                "department_id": departments["MECH"].id,
                "password": "password123"
            },
            {
                "email": "employee5@factory.com",
                "username": "employee5",
                "full_name": "Emma Davis",
                "employee_id": "EMP005",
                "role": models.Role.EMPLOYEE,
                "division_id": divisions["Logistics"].id,
                "department_id": departments["WARE"].id,
                "password": "password123"
            },
        ]
        
        for emp_data in employees_data:
            user = models.User(
                email=emp_data["email"],
                username=emp_data["username"],
                full_name=emp_data["full_name"],
                password_hash=get_password_hash(emp_data["password"]),
                employee_id=emp_data["employee_id"],
                role=emp_data["role"],
                division_id=emp_data["division_id"],
                department_id=emp_data.get("department_id"),
                is_active=True
            )
            db.add(user)
            print(f"✓ Employee {emp_data['full_name']} created")
        
        # Create sample shifts
        shifts_data = [
            {"name": "Morning", "start_time": "08:00", "end_time": "16:00", "description": "Morning shift"},
            {"name": "Afternoon", "start_time": "16:00", "end_time": "00:00", "description": "Afternoon shift"},
            {"name": "Night", "start_time": "00:00", "end_time": "08:00", "description": "Night shift"},
        ]
        
        for shift_data in shifts_data:
            shift = models.Shift(**shift_data)
            db.add(shift)
            print(f"✓ Shift {shift_data['name']} created")
        
        db.commit()
        print("\n✅ Database seeded successfully!")
        print("\nTest credentials:")
        print("Admin: admin / 1234")
        print("Production Division Manager: prod_manager / password123")
        print("Quality Division Manager: quality_manager / password123")
        print("Department Manager A: dept_manager_a / password123")
        print("Employee 1: employee1 / password123")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()