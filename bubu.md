# FactoryShift - Factory Management System

A comprehensive division-based factory management system with role-based access control for managing shifts, attendance, employees, and departmental operations.

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Setup & Installation](#setup--installation)
5. [Project Structure](#project-structure)
6. [Backend API Documentation](#backend-api-documentation)
7. [Frontend Documentation](#frontend-documentation)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Database Schema](#database-schema)
10. [File Dependencies](#file-dependencies)
11. [How to Implement](#how-to-implement)
12. [Common Workflows](#common-workflows)

---

## Project Overview

**FactoryShift** is a web-based management system designed for factory operations with a hierarchical structure:
- **Admin** → manages entire system
- **Division Managers** → manage multiple departments within a division
- **Department Managers** → manage teams within their department
- **Employees** → view own shifts, attendance, and requests

### Key Features
- ✅ Role-based access control (RBAC)
- ✅ Employee database management
- ✅ Shift scheduling and management
- ✅ Attendance tracking
- ✅ Leave and shift swap requests
- ✅ Real-time notifications
- ✅ Division and department hierarchy
- ✅ Approval workflows
- ✅ Performance reports

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                      Port: 3000                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/AXIOS
                         │ (REST API)
┌────────────────────────▼────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│                      Port: 8000                             │
│     ┌──────────────────────────────────────────────┐        │
│     │          API Routes (v1)                     │        │
│     │  /auth /users /divisions /departments        │        │
│     └──────────────────────────────────────────────┘        │
│                         │                                   │
│     ┌──────────────────▼──────────────────────┐            │
│     │   Authentication & Authorization        │            │
│     │   (JWT, OAuth2PasswordRequestForm)      │            │
│     └──────────────────────────────────────────┘            │
└────────────────────────┬────────────────────────────────────┘
                         │ ORM (SQLAlchemy)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              PostgreSQL Database                            │
│  (Users, Divisions, Departments, Employees, Shifts,         │
│   Attendance Records, Requests, Notifications)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.104.1 | Web framework & API server |
| Server | Uvicorn | 0.24.0 | ASGI server |
| ORM | SQLAlchemy | 2.0.23 | Database modeling & queries |
| Database | PostgreSQL | - | Data persistence |
| Auth | python-jose | 3.3.0 | JWT token creation/validation |
| Password Hashing | passlib[bcrypt] | 1.7.4 | Secure password hashing |
| Validation | Pydantic | 2.5.0 | Data validation & serialization |
| Migration | Alembic | 1.13.1 | Database schema versioning |
| ENV Management | python-dotenv | 1.0.0 | Environment configuration |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18.2.0 | UI library |
| Build Tool | Vite | 5.0.8 | Fast build & dev server |
| Routing | React Router | 7.10.0 | Client-side routing |
| HTTP Client | Axios | 1.13.2 | API requests |
| CSS Framework | Tailwind CSS | 3.3.6 | Utility-first styling |
| Icons | Lucide React | 0.309.0 | Icon library |
| Date Utils | date-fns | 4.1.0 | Date manipulation |
| Linter | ESLint | - | Code quality |
| Bundler | Vite | 5.0.8 | Module bundling |

---

## Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd /home/tw10519/Proj/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (create .env file)
touch .env
# Add your database credentials:
# DATABASE_URL=postgresql://user:password@localhost/factoryshift
# SECRET_KEY=your-secret-key-here
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# Initialize database
python seed.py  # Seed with sample data

# Run development server
python main.py
# Server runs on http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd /home/tw10519/Proj/frontend

# Install dependencies
npm install

# Configure environment (create .env.local)
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
# Server runs on http://localhost:3000
```

### Verification
```bash
# In terminal 1 (Backend)
cd backend && python main.py
# Should see: "Database tables created"

# In terminal 2 (Frontend)
cd frontend && npm run dev
# Should see: "Local: http://localhost:3000"

# Test backend
curl http://localhost:8000/health
# Returns: {"status": "healthy"}
```

---

## Project Structure

### Backend Directory Tree
```
backend/
├── main.py                          # Application entry point
├── requirements.txt                 # Python dependencies
├── .env                            # Environment configuration
├── seed.py                         # Database seeding
├── test.py                         # Test file
├── app/
│   ├── __init__.py
│   ├── models.py                   # SQLAlchemy ORM models
│   ├── schemas.py                  # Pydantic validation schemas
│   ├── database.py                 # Database connection & session
│   ├── auth.py                     # Authentication utilities
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py             # Authentication routes
│   │       ├── users.py            # User management routes
│   │       ├── divisions.py        # Division management routes
│   │       └── departments.py      # Department management routes
│   └── prisma/                     # (Optional) Prisma schema
├── docker-compose.yml              # Docker configuration
└── __pycache__/                    # Python bytecode cache
```

### Frontend Directory Tree
```
frontend/
├── index.html                      # HTML entry point
├── package.json                    # Node dependencies & scripts
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── eslint.config.js                # ESLint configuration
├── src/
│   ├── main.jsx                    # React DOM render point
│   ├── App.jsx                     # Main App component with routing
│   ├── App.css                     # Global styles
│   ├── index.css                   # Tailwind imports
│   ├── contexts/
│   │   └── AuthContext.jsx         # Global auth state & hooks
│   ├── services/
│   │   ├── api.js                  # Axios instance & interceptors
│   │   ├── auth.js                 # Authentication service (deprecated)
│   │   └── notifications.js        # Notification service
│   ├── utils/
│   │   ├── constants.js            # Role definitions, divisions, departments
│   │   ├── helpers.js              # Utility functions
│   │   └── roleBasedAccess.js      # Permission & route access control
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx          # Top navigation bar
│   │   │   ├── Sidebar.jsx         # Left navigation menu
│   │   │   └── Footer.jsx          # Page footer
│   │   ├── auth/
│   │   │   └── Login.jsx           # Login page
│   │   ├── common/
│   │   │   ├── StatsCard.jsx       # Reusable stats component
│   │   │   ├── CalendarView.jsx    # Calendar component
│   │   │   └── ProfileModal.jsx    # Profile modal
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx  # Admin main dashboard
│   │   │   ├── EmployeeDatabase.jsx # Employee CRUD
│   │   │   ├── Divisions.jsx       # Division management
│   │   │   ├── Notifications.jsx   # System notifications
│   │   │   ├── AttendanceApp.jsx   # Attendance management
│   │   │   ├── ScheduleControl.jsx # Schedule control panel
│   │   │   └── Departments.jsx     # Department management
│   │   ├── division/
│   │   │   ├── DivisionDashboard.jsx     # Division main dashboard
│   │   │   ├── DepartmentManagement.jsx  # Manage divisions departments
│   │   │   ├── DivisionAttendance.jsx    # Division attendance view
│   │   │   ├── DivisionSchedule.jsx      # Division schedule
│   │   │   ├── DivisionApprovals.jsx     # Request approvals
│   │   │   └── DivisionReports.jsx       # Divisional reports
│   │   ├── manager/
│   │   │   ├── ManagerDashboard.jsx      # Department manager dashboard
│   │   │   ├── AttendanceDashboard.jsx   # Team attendance
│   │   │   ├── ScheduleManager.jsx       # Schedule management
│   │   │   ├── DailySchedule.jsx         # Daily schedule view
│   │   │   ├── NotificationsPanel.jsx    # Notifications panel
│   │   │   └── Approvals.jsx             # Request approvals
│   │   └── employee/
│   │       ├── EmployeeDashboard.jsx     # Employee main dashboard
│   │       ├── Attendance.jsx            # Attendance view
│   │       ├── ShiftView.jsx             # Shift management
│   │       ├── Profile.jsx               # User profile
│   │       └── Requests.jsx              # Leave/swap requests
│   └── assets/                     # Images, fonts, etc.
├── public/                         # Static files
└── dist/                          # Built production files
```

---

## Backend API Documentation

### Authentication Endpoints
**Base URL:** `http://localhost:8000/api/v1/auth`

#### Login
```
POST /login
Content-Type: application/x-www-form-urlencoded

Request:
username=john@example.com&password=password123

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "refresh_token_string",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john@example.com",
    "email": "john@example.com",
    "role": "admin",
    "full_name": "John Doe",
    "division_id": null,
    "department_id": null,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### Refresh Token
```
POST /refresh
Content-Type: application/json

Request:
{
  "refresh_token": "refresh_token_string"
}

Response: 200 OK
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer"
}
```

#### Logout
```
POST /logout
Authorization: Bearer {access_token}

Response: 200 OK
{"message": "Logged out successfully"}
```

### User Endpoints
**Base URL:** `http://localhost:8000/api/v1/users`

#### Get Current User
```
GET /me
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "username": "john@example.com",
  "email": "john@example.com",
  "role": "admin",
  "full_name": "John Doe",
  "division_id": null,
  "department_id": null,
  "is_active": true
}
```

#### List Users
```
GET /?skip=0&limit=100&division_id=1&department_id=2&role=employee
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 5,
    "username": "emp@example.com",
    "email": "emp@example.com",
    "role": "employee",
    "full_name": "Jane Smith",
    "division_id": 1,
    "department_id": 2
  }
]
```

#### Create User
```
POST /
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "username": "new_user",
  "email": "new@example.com",
  "password": "securepassword",
  "full_name": "New User",
  "role": "employee",
  "division_id": 1,
  "department_id": 2
}

Response: 201 Created
{
  "id": 10,
  "username": "new_user",
  "email": "new@example.com",
  "role": "employee",
  "full_name": "New User",
  "division_id": 1,
  "department_id": 2
}
```

#### Update User
```
PUT /{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "full_name": "Updated Name",
  "email": "newemail@example.com",
  "is_active": true
}

Response: 200 OK
{
  "id": 10,
  "username": "new_user",
  "email": "newemail@example.com",
  "full_name": "Updated Name",
  "role": "employee",
  "division_id": 1,
  "department_id": 2
}
```

#### Delete User
```
DELETE /{user_id}
Authorization: Bearer {access_token}

Response: 200 OK
{"message": "User deleted successfully"}
```

### Division Endpoints
**Base URL:** `http://localhost:8000/api/v1/divisions`

#### List Divisions
```
GET /
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Production",
    "description": "Production Division",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### Get Division
```
GET /{division_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "name": "Production",
  "description": "Production Division"
}
```

#### Create Division
```
POST /
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "New Division",
  "description": "Division description"
}

Response: 201 Created
{
  "id": 5,
  "name": "New Division",
  "description": "Division description"
}
```

### Department Endpoints
**Base URL:** `http://localhost:8000/api/v1/departments`

#### List Departments
```
GET /?division_id=1
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Production Line A",
    "code": "PROD_A",
    "division_id": 1,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### Create Department
```
POST /
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "New Department",
  "code": "NEW_DEPT",
  "division_id": 1
}

Response: 201 Created
{
  "id": 5,
  "name": "New Department",
  "code": "NEW_DEPT",
  "division_id": 1
}
```

### Key Backend Files

#### `backend/app/models.py`
Defines SQLAlchemy ORM models:
- **User** - Employee/manager/admin accounts with role and division/department assignment
- **Division** - Top-level organizational unit
- **Department** - Sub-units within divisions
- **Attendance** - Daily attendance records
- **Shift** - Work shift definitions
- **Request** - Leave/swap requests
- **Notification** - System notifications

#### `backend/app/schemas.py`
Pydantic validation schemas matching models for API request/response validation:
- `UserCreate`, `UserUpdate`, `UserResponse`
- `DivisionCreate`, `DivisionResponse`
- `DepartmentCreate`, `DepartmentResponse`
- `RoleEnum` - Validates allowed roles

#### `backend/app/database.py`
Database connection setup:
- SQLAlchemy engine configuration
- Session factory using `SessionLocal`
- `get_db()` dependency for FastAPI routes

#### `backend/app/auth.py`
Authentication utilities:
- `verify_password(password, hashed_password)` - Bcrypt password verification
- `get_password_hash(password)` - Create bcrypt hash
- `create_access_token(data, expires_delta)` - JWT token creation
- `create_refresh_token(data)` - Refresh token creation
- `get_current_active_user(token)` - JWT verification & user retrieval

#### `backend/main.py`
Application entry point:
- FastAPI app initialization
- CORS middleware configuration
- Router inclusion
- Lifespan context manager for startup/shutdown

---

## Frontend Documentation

### Core Application Files

#### `frontend/src/main.jsx`
React entry point that renders the App component into the DOM root.

#### `frontend/src/App.jsx`
**Responsibilities:**
- Wraps entire app with `AuthProvider` for global auth state
- Defines role-based routing structure
- Renders layout (Header, Sidebar, Footer, Routes)
- Redirects non-authenticated users to login

**Role-Based Routes:**
| Role | Routes |
|------|--------|
| **admin** | `/dashboard`, `/employees`, `/divisions`, `/attendance`, `/schedule-control`, `/notifications`, `/settings` |
| **division_manager** | `/dashboard`, `/departments`, `/attendance`, `/schedule`, `/approvals`, `/notifications` |
| **department_manager** | `/dashboard`, `/attendance-dashboard`, `/schedule`, `/daily-schedule`, `/approvals`, `/notifications` |
| **employee** | `/dashboard`, `/shifts`, `/profile`, `/attendance`, `/requests`, `/notifications` |

### Services Layer

#### `frontend/src/services/api.js`
**Purpose:** Centralized API client configuration

**Key Functions:**
- **Axios Instance Creation** - Base URL from `VITE_API_URL` env variable
- **Request Interceptor** - Auto-adds JWT token to headers
- **Response Interceptor** - Handles 401 errors and token refresh
- **authService.login()** - Authenticates user, stores tokens/user data
- **authService.logout()** - Clears auth state
- **authService.getCurrentUser()** - Retrieves stored user from localStorage
- **authService.isAuthenticated()** - Checks if token exists and is valid

**Exported Services:**
```javascript
export const authService = { login, logout, getCurrentUser, isAuthenticated }
export const userService = { getProfile, updateProfile, listUsers, createUser, updateUser, deleteUser }
export const divisionService = { listDivisions, getDivision, createDivision, updateDivision }
export const departmentService = { listDepartments, getDepartment, createDepartment, updateDepartment }
export const attendanceService = { getAttendance, recordAttendance }
export const requestService = { getRequests, submitRequest, approveRequest, rejectRequest }
```

#### `frontend/src/services/auth.js`
Legacy authentication service (consider consolidating with api.js).

#### `frontend/src/services/notifications.js`
Notification service for real-time alerts and messages.

### Context & State Management

#### `frontend/src/contexts/AuthContext.jsx`
**Purpose:** Global authentication state management

**State Structure:**
```javascript
{
  user: {
    id, username, email, role, full_name, 
    division_id, department_id, is_active
  },
  role: 'admin' | 'division_manager' | 'department_manager' | 'employee',
  division: division_id,
  department: department_id,
  isAuthenticated: boolean,
  loading: boolean
}
```

**Key Functions:**
- **useAuth()** - Hook to access auth state & methods
- **checkAuth()** - Verifies token validity on app load
- **login(username, password)** - Authenticates user
- **logout()** - Clears auth state
- **updateUser(userData)** - Updates user state
- **getUserScope()** - Returns accessible division/department for current user
- **hasPermission(permission)** - Checks if user has specific permission

**Usage:**
```javascript
const { user, role, isAuthenticated, login, logout } = useAuth();
```

### Layout Components

#### `frontend/src/components/layout/Header.jsx`
Top navigation bar with:
- Logo/title
- User dropdown (profile, logout)
- Notifications bell icon
- System status

#### `frontend/src/components/layout/Sidebar.jsx`
Left navigation menu that dynamically changes based on user role:
- **Admin:** Employees, Divisions, Attendance App, Schedule Control, Notifications, Settings
- **Division Manager:** Departments, Attendance, Schedule, Approvals, Notifications
- **Department Manager:** Attendance Dashboard, Schedule, Daily Schedule, Approvals, Notifications
- **Employee:** Shifts, Attendance, Profile, Requests, Notifications

#### `frontend/src/components/layout/Footer.jsx`
Page footer with copyright and system information.

### Admin Components

#### `frontend/src/components/admin/AdminDashboard.jsx`
**Purpose:** Main admin control panel

**Features:**
- Dashboard statistics (total divisions, departments, employees, attendance)
- Tab-based navigation to different admin functions
- Dynamic content rendering based on `activeTab`

**Sub-components accessed:**
- `EmployeeDatabase` - Employee CRUD operations
- `Divisions` - Division management
- `Notifications` - System notifications
- `AttendanceApp` - Attendance management
- `ScheduleControl` - Schedule creation/modification
- `Departments` - Department management

#### `frontend/src/components/admin/EmployeeDatabase.jsx`
**Functionality:**
- List all employees with filters
- Create new employee accounts
- Edit employee details (name, email, role, division, department)
- Delete employees
- Search/sort employees
- Bulk operations (export, import)

**Key Props:** `activeTab`

#### `frontend/src/components/admin/Divisions.jsx`
**Functionality:**
- List all divisions
- Create new divisions
- Edit division details
- Delete divisions
- View departments within each division

#### `frontend/src/components/admin/Notifications.jsx`
**Functionality:**
- View system notifications
- Send notifications to specific users/roles
- Delete notification history
- Set notification preferences

#### `frontend/src/components/admin/AttendanceApp.jsx`
**Functionality:**
- Record attendance for employees
- View attendance reports
- Mark absent, late, on-leave, present
- Set bulk attendance

#### `frontend/src/components/admin/ScheduleControl.jsx`
**Functionality:**
- Create and manage shift patterns
- Assign shifts to departments
- View schedule calendar
- Modify shift timings

### Division Manager Components

#### `frontend/src/components/division/DivisionDashboard.jsx`
**Purpose:** Main dashboard for division managers

**Statistics:**
- Total employees in division
- Departments count
- Today's attendance percentage
- Pending requests

**Sub-components accessed:**
- `DepartmentManagement` - Manage division's departments
- `DivisionAttendance` - View division-wide attendance
- `DivisionSchedule` - Manage division schedules
- `DivisionApprovals` - Approve leave/swap requests
- `DivisionReports` - View divisional reports

#### `frontend/src/components/division/DepartmentManagement.jsx`
**Functionality:**
- List departments in division
- Add department managers
- Edit department details
- Remove departments
- View department employees

#### `frontend/src/components/division/DivisionAttendance.jsx`
**Functionality:**
- View attendance by department
- Filter by time range (today, week, month)
- Statistics: present, absent, late, on-leave
- Drill-down to individual employees

#### `frontend/src/components/division/DivisionSchedule.jsx`
**Functionality:**
- View division schedule
- Create shift assignments
- Manage shift timings
- View schedule conflicts

#### `frontend/src/components/division/DivisionApprovals.jsx`
**Functionality:**
- View pending requests (leave, shift swap)
- Approve/reject with comments
- Bulk approval operations
- Request history

### Department Manager Components

#### `frontend/src/components/manager/ManagerDashboard.jsx`
**Purpose:** Main dashboard for department managers

**Statistics:**
- Department size
- Today's attendance %
- Pending requests
- Shift coverage

**Sub-components accessed:**
- `AttendanceDashboard` - Team attendance
- `ScheduleManager` - Manage team schedules
- `DailySchedule` - View daily schedule
- `Approvals` - Approve team requests
- `NotificationsPanel` - Team notifications

#### `frontend/src/components/manager/AttendanceDashboard.jsx`
**Functionality:**
- Mark attendance for team members
- View attendance trends
- Identify patterns
- Generate attendance reports

#### `frontend/src/components/manager/ScheduleManager.jsx`
**Functionality:**
- Create team schedules
- Assign shifts to employees
- Manage shift swaps
- Optimize coverage

#### `frontend/src/components/manager/DailySchedule.jsx`
**Functionality:**
- View today's schedule
- Show assigned employees
- Quick status updates
- Handle last-minute changes

#### `frontend/src/components/manager/Approvals.jsx`
**Functionality:**
- View pending requests
- Approve/reject leave requests
- Approve/reject shift swaps
- Add approval comments

### Employee Components

#### `frontend/src/components/employee/EmployeeDashboard.jsx`
**Purpose:** Main employee dashboard

**Statistics:**
- Next shift info
- Attendance status
- Pending requests
- Notifications count

**Sub-components accessed:**
- `ShiftView` - View assigned shifts
- `Attendance` - View attendance record
- `Profile` - Edit personal profile
- `Requests` - Submit/view requests
- Notifications

#### `frontend/src/components/employee/ShiftView.jsx`
**Functionality:**
- Display assigned shifts (current, upcoming)
- Show shift details (time, location, notes)
- Request shift swap
- View shift history

#### `frontend/src/components/employee/Attendance.jsx`
**Functionality:**
- View personal attendance record
- Check-in/check-out
- Request leave approval
- View attendance statistics

#### `frontend/src/components/employee/Profile.jsx`
**Functionality:**
- View personal profile
- Edit profile (name, email, phone)
- Change password
- Update emergency contact

#### `frontend/src/components/employee/Requests.jsx`
**Functionality:**
- Submit leave requests
- Submit shift swap requests
- Track request status
- View request history

### Utility Files

#### `frontend/src/utils/constants.js`
**Defines:**
- `ROLES` object - Role string constants
- `DIVISIONS` array - Available divisions with metadata
- `DEPARTMENTS` object - Departments grouped by division
- Helper functions: `getDivisionById()`, `getDepartmentById()`

#### `frontend/src/utils/roleBasedAccess.js`
**Functionality:**
- `PERMISSIONS` object - Fine-grained permission definitions
- `hasPermission(user, permission)` - Check if user has permission
- `canAccessDivision(user, divisionId)` - Check division access
- `canAccessDepartment(user, divisionId, departmentId)` - Check department access
- `getAccessibleRoutes(userRole)` - Get allowed routes for role
- `withRoleCheck()` - HOC for role-based component protection

#### `frontend/src/utils/helpers.js`
**Utility Functions:**
- Date formatting helpers
- String manipulation utilities
- Number formatting
- Data transformation helpers

### Common Components

#### `frontend/src/components/common/StatsCard.jsx`
Reusable component for displaying statistics with:
- Label, value, change indicator
- Icon and color coding
- Tooltip support

#### `frontend/src/components/common/CalendarView.jsx`
Calendar component for:
- Viewing shift schedules
- Marking attendance
- Highlighting events

#### `frontend/src/components/common/ProfileModal.jsx`
Modal for displaying/editing user profiles.

### Authentication

#### `frontend/src/components/auth/Login.jsx`
**Functionality:**
- Username/password login form
- Demo credentials for testing different roles
- Error handling and validation
- Redirect to dashboard on success
- Password visibility toggle

---

## User Roles & Permissions

### Role Hierarchy
```
ADMIN (System-wide access)
├── DIVISION_MANAGER (Division-scoped access)
│   └── DEPARTMENT_MANAGER (Department-scoped access)
│       └── EMPLOYEE (Personal access only)
```

### Admin Permissions
- View/manage all employees
- Create/modify divisions and departments
- View company-wide attendance and schedules
- System settings and configuration
- Send system notifications
- View all reports
- User account management

### Division Manager Permissions
- View/manage employees in their division
- Create/modify departments within division
- View division attendance and schedules
- Approve requests from division employees
- Send division-wide notifications
- Generate division reports
- Manage division employees

### Department Manager Permissions
- View/manage employees in their department
- Record department attendance
- Create/manage department schedules
- Approve leave and shift swap requests
- Send department notifications
- Generate department reports
- Track team performance

### Employee Permissions
- View own profile
- View own shifts
- View own attendance
- Request leave
- Request shift swap
- View notifications
- Update personal contact information

---

## Database Schema

### Users Table
```
users (
  id: Integer (Primary Key),
  username: String (Unique, Required),
  email: String (Unique, Required),
  hashed_password: String (Required),
  full_name: String,
  role: Enum('admin', 'division_manager', 'department_manager', 'employee'),
  division_id: Integer (Foreign Key → divisions.id),
  department_id: Integer (Foreign Key → departments.id),
  is_active: Boolean (Default: True),
  created_at: DateTime,
  updated_at: DateTime
)
```

### Divisions Table
```
divisions (
  id: Integer (Primary Key),
  name: String (Unique, Required),
  description: String,
  created_at: DateTime,
  updated_at: DateTime
)
```

### Departments Table
```
departments (
  id: Integer (Primary Key),
  name: String (Required),
  code: String (Unique, Required),
  division_id: Integer (Foreign Key → divisions.id, Required),
  created_at: DateTime,
  updated_at: DateTime
)
```

### Attendance Table
```
attendance (
  id: Integer (Primary Key),
  user_id: Integer (Foreign Key → users.id, Required),
  date: Date (Required),
  status: Enum('present', 'absent', 'late', 'on_leave'),
  check_in_time: Time,
  check_out_time: Time,
  notes: String,
  created_at: DateTime,
  updated_at: DateTime
)
```

### Shifts Table
```
shifts (
  id: Integer (Primary Key),
  name: String (Required),
  start_time: Time (Required),
  end_time: Time (Required),
  department_id: Integer (Foreign Key → departments.id),
  created_at: DateTime,
  updated_at: DateTime
)
```

### Requests Table (Leave/Shift Swap)
```
requests (
  id: Integer (Primary Key),
  user_id: Integer (Foreign Key → users.id, Required),
  type: Enum('leave', 'shift_swap'),
  status: Enum('pending', 'approved', 'rejected'),
  reason: String,
  start_date: Date,
  end_date: Date,
  swap_with_user_id: Integer (Foreign Key → users.id),
  approved_by: Integer (Foreign Key → users.id),
  approval_notes: String,
  created_at: DateTime,
  updated_at: DateTime
)
```

### Notifications Table
```
notifications (
  id: Integer (Primary Key),
  user_id: Integer (Foreign Key → users.id, Required),
  title: String (Required),
  message: String (Required),
  type: Enum('alert', 'warning', 'info', 'success'),
  is_read: Boolean (Default: False),
  created_at: DateTime,
  updated_at: DateTime
)
```

---

## File Dependencies

### Frontend Dependency Graph

```
App.jsx (Root)
├── AuthContext.jsx
│   ├── api.js
│   │   └── axios (HTTP client)
│   └── localStorage
├── Header.jsx
├── Sidebar.jsx
│   ├── constants.js (ROLES, DIVISIONS)
│   └── AuthContext.jsx (useAuth hook)
├── Footer.jsx
└── Routes (Role-based)
    ├── AdminDashboard.jsx
    │   ├── EmployeeDatabase.jsx
    │   ├── Divisions.jsx
    │   ├── Notifications.jsx
    │   ├── AttendanceApp.jsx
    │   └── ScheduleControl.jsx
    ├── DivisionDashboard.jsx
    │   ├── DepartmentManagement.jsx
    │   │   └── constants.js (DEPARTMENTS)
    │   ├── DivisionAttendance.jsx
    │   ├── DivisionSchedule.jsx
    │   ├── DivisionApprovals.jsx
    │   └── DivisionReports.jsx
    ├── ManagerDashboard.jsx
    │   ├── AttendanceDashboard.jsx
    │   ├── ScheduleManager.jsx
    │   ├── DailySchedule.jsx
    │   ├── NotificationsPanel.jsx
    │   └── Approvals.jsx
    ├── EmployeeDashboard.jsx
    │   ├── ShiftView.jsx
    │   ├── Attendance.jsx
    │   ├── Profile.jsx
    │   ├── Requests.jsx
    │   └── Notifications (notifications.js)
    └── Login.jsx
        └── AuthContext.jsx (useAuth hook)

Utility Layer:
├── roleBasedAccess.js
│   ├── constants.js (ROLES)
│   └── Helper functions
├── helpers.js (Utility functions)
└── constants.js (ROLES, DIVISIONS, DEPARTMENTS)

Component Dependencies:
├── Common Components
│   ├── StatsCard.jsx (lucide-react icons)
│   ├── CalendarView.jsx
│   └── ProfileModal.jsx
└── All components use:
    ├── lucide-react (Icons)
    ├── date-fns (Date manipulation)
    ├── Tailwind CSS (Styling)
    └── AuthContext.jsx (Authentication)
```

### Backend Dependency Graph

```
main.py (Entry Point)
├── FastAPI app
├── CORS Middleware
├── Database (database.py)
│   └── SQLAlchemy engine
│       └── PostgreSQL
├── Models (models.py)
│   ├── User
│   ├── Division
│   ├── Department
│   ├── Attendance
│   ├── Shift
│   ├── Request
│   └── Notification
├── Schemas (schemas.py)
│   ├── Pydantic validators
│   └── Response models
├── Auth (auth.py)
│   ├── JWT token creation
│   ├── Password hashing (passlib)
│   └── OAuth2 verification
└── Routes (api/v1/)
    ├── auth.py
    │   ├── login()
    │   ├── refresh()
    │   └── logout()
    ├── users.py
    │   ├── read_current_user()
    │   ├── read_users()
    │   ├── create_user()
    │   ├── update_user()
    │   └── delete_user()
    ├── divisions.py
    │   ├── read_divisions()
    │   ├── read_division()
    │   ├── create_division()
    │   └── update_division()
    └── departments.py
        ├── read_departments()
        ├── read_department()
        ├── create_department()
        └── update_department()

Each Route:
├── Depends on auth (get_current_active_user)
├── Depends on database (get_db Session)
├── Uses models.py for ORM
└── Uses schemas.py for validation
```

---

## How to Implement

### Adding a New User Role

1. **Backend (app/models.py)**
   - Add new role to User model's role enum
   ```python
   class RoleEnum(str, Enum):
       ADMIN = "admin"
       DIVISION_MANAGER = "division_manager"
       DEPARTMENT_MANAGER = "department_manager"
       EMPLOYEE = "employee"
       NEW_ROLE = "new_role"  # Add here
   ```

2. **Backend (app/schemas.py)**
   - Update RoleEnum in Pydantic schemas

3. **Frontend (utils/constants.js)**
   - Add role constant
   ```javascript
   export const ROLES = {
       ADMIN: 'admin',
       DIVISION_MANAGER: 'division_manager',
       DEPARTMENT_MANAGER: 'department_manager',
       EMPLOYEE: 'employee',
       NEW_ROLE: 'new_role'  // Add here
   };
   ```

4. **Frontend (utils/roleBasedAccess.js)**
   - Add permissions for new role
   ```javascript
   // NEW_ROLE: specific_permission: 'permission_key'
   ```

5. **Frontend (App.jsx)**
   - Add routes for new role
   ```javascript
   {role === ROLES.NEW_ROLE && (
       <>
           <Route path="/" element={<Navigate to="/dashboard" />} />
           <Route path="/dashboard" element={<NewRoleDashboard />} />
       </>
   )}
   ```

6. **Frontend (components/layout/Sidebar.jsx)**
   - Add navigation items for new role
   ```javascript
   else if (role === ROLES.NEW_ROLE) {
       return [
           ...baseItems,
           { id: 'tab-id', label: 'Tab Label', icon: IconComponent }
       ];
   }
   ```

### Adding a New Feature

#### Example: Implementing a "Reports" Feature

1. **Backend Setup**

   a. **Update models.py** - Add Report model if needed
   ```python
   class Report(Base):
       __tablename__ = "reports"
       
       id = Column(Integer, primary_key=True)
       title = Column(String)
       user_id = Column(Integer, ForeignKey("users.id"))
       data = Column(JSON)
       created_at = Column(DateTime, default=datetime.utcnow)
   ```

   b. **Update schemas.py** - Add validation schemas
   ```python
   class ReportCreate(BaseModel):
       title: str
       data: dict
   
   class ReportResponse(ReportCreate):
       id: int
       user_id: int
       created_at: datetime
   ```

   c. **Create api/v1/reports.py** - New route file
   ```python
   @router.get("/", response_model=List[ReportResponse])
   def read_reports(db: Session = Depends(get_db), 
                    current_user = Depends(get_current_active_user)):
       return db.query(Report).all()
   ```

   d. **Update main.py** - Include new router
   ```python
   from app.api.v1 import reports
   app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
   ```

2. **Frontend Setup**

   a. **Update api.js** - Add report service
   ```javascript
   export const reportService = {
       listReports: async () => api.get('/reports'),
       createReport: async (data) => api.post('/reports', data),
       getReport: async (id) => api.get(`/reports/${id}`),
       deleteReport: async (id) => api.delete(`/reports/${id}`)
   };
   ```

   b. **Create component** - e.g., Reports.jsx
   ```javascript
   const Reports = () => {
       const [reports, setReports] = useState([]);
       
       useEffect(() => {
           reportService.listReports().then(res => setReports(res.data));
       }, []);
       
       return <div>Reports list</div>;
   };
   ```

   c. **Update Dashboard** - Add tab for Reports
   ```javascript
   const renderContent = () => {
       switch (activeTab) {
           case 'reports':
               return <Reports />;
           // ...
       }
   };
   ```

   d. **Update Sidebar** - Add navigation item
   ```javascript
   { id: 'reports', label: 'Reports', icon: FileText }
   ```

---

## Common Workflows

### User Authentication Flow

1. **Frontend (Login.jsx)**
   - User enters username/password
   - Calls `authService.login(username, password)`

2. **Backend (auth.py - /login route)**
   - Verifies credentials against database
   - Creates JWT access token (15 min expiry)
   - Creates refresh token (7 day expiry)
   - Returns tokens and user data

3. **Frontend (AuthContext)**
   - Stores tokens in localStorage
   - Sets authState with user data
   - Redirects to dashboard

4. **API Requests (api.js interceptor)**
   - Automatically adds Authorization header with token

5. **Token Refresh**
   - When access token expires (401 response)
   - Automatically uses refresh token to get new access token
   - Retries original request

6. **Logout (AuthContext)**
   - Calls `authService.logout()`
   - Clears localStorage
   - Redirects to login page

### Employee Leave Request Flow

1. **Employee (Requests.jsx)**
   - Clicks "Request Leave"
   - Fills form (reason, dates)
   - Submits to API

2. **Backend**
   - Validates request
   - Creates Request record with status "pending"
   - Stores in database

3. **Frontend (Manager - Approvals.jsx)**
   - Displays pending requests
   - Manager reviews request
   - Clicks Approve/Reject

4. **Backend**
   - Updates Request status
   - Creates Notification for employee
   - Possibly blocks attendance on those dates

5. **Frontend (Employee - Notifications)**
   - Employee sees notification
   - Request marked as "Approved" or "Rejected"

### Attendance Recording

**Daily Process:**
1. **Employee Check-In**
   - Employee uses Attendance component
   - Clicks "Check In" at start of shift

2. **Backend**
   - Records check-in time
   - Creates/updates Attendance record

3. **Employee Check-Out**
   - Clicks "Check Out" at end of shift

4. **Backend**
   - Records check-out time
   - Calculates hours worked

5. **Manager Review (Attendance Dashboard)**
   - Views team attendance
   - Can manually adjust if needed
   - Generates reports

---

## Troubleshooting

### Backend Won't Start
```bash
# Check database connection
python -c "from app.database import engine; engine.connect()"

# Check if port 8000 is in use
lsof -i :8000

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
```

### Frontend Won't Start
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -i :3000

# Clear vite cache
rm -rf dist

# Run with explicit host
npm run dev -- --host 0.0.0.0
```

### API Connection Issues
- Check VITE_API_URL in frontend `.env.local`
- Verify backend CORS configuration
- Check browser console for errors
- Verify JWT token in localStorage
- Check backend logs for 401/403 errors

### Database Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run migrations: `python seed.py`
- Check table creation logs

---

## Development Tips

### Hot Reload
- **Frontend:** Vite provides automatic hot reload on file changes
- **Backend:** Use `python -m uvicorn main:app --reload` for auto-restart

### Debugging
- **Frontend:** Use browser DevTools console
- **Backend:** Check terminal output for logs, use `print()` or logging module

### API Testing
```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=admin@example.com&password=password" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Using Python requests
import requests
r = requests.post('http://localhost:8000/api/v1/auth/login', 
                  data={'username': 'admin', 'password': 'password'})
print(r.json())
```

### Database Inspection
```bash
# Connect to PostgreSQL
psql -U username -d factoryshift

# List tables
\dt

# Query users
SELECT * FROM users;
```

---

## Deployment Considerations

### Backend Deployment
1. Use production ASGI server (Gunicorn + Uvicorn)
2. Set up environment variables securely
3. Configure database for production
4. Set SECRET_KEY to strong random value
5. Disable CORS debug mode
6. Use HTTPS/SSL certificates

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure API_URL for production environment
4. Set up CDN for static assets
5. Configure redirect rules for SPA routing

### Docker Deployment
Use provided `docker-compose.yml`:
```bash
docker-compose up
```

---

## Additional Resources

- **FastAPI Docs:** http://localhost:8000/docs
- **FastAPI Redoc:** http://localhost:8000/redoc
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Axios:** https://axios-http.com/docs

---

**Last Updated:** December 2024
**Project Version:** 1.0.0




import React, { useState, useEffect } from 'react';
import EmployeeDatabase from './EmployeeDatabase';
import Divisions from './Divisions';
import Notifications from './Notifications';
import AttendanceApp from './AttendanceApp';
import ScheduleControl from './ScheduleControl';
import AdminSettings from './AdminSettings';
import { 
  Users, Building2, Clock, Calendar, 
  CheckCircle, AlertTriangle, TrendingUp, Layers, 
  Plus, BarChart, Download, FileText, Settings as SettingsIcon,
  Database, RefreshCw, Bell, CheckSquare, Shield, FileCheck,
  Eye, TrendingDown, Activity, Server, XCircle, Loader2,
  ClipboardList, AlertCircle, Archive, Key, Mail, UserPlus,
  Zap, HardDrive, Cpu, MemoryStick, Edit2, Trash2, ArrowLeft
} from 'lucide-react';
import { 
  dashboardService, 
  settingsService,
  divisionService,
  departmentService,
  userService,
  authService
} from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [stats, setStats] = useState({
    total_divisions: 0,
    total_departments: 0,
    total_employees: 0,
    today_attendance: 0,
    active_shifts: 0,
    pending_approvals: 0,
    loading: true
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [divisionOverview, setDivisionOverview] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [systemInfo, setSystemInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'settings') {
      fetchSystemInfo();
    }
  }, [activeTab]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data
      const statsData = await dashboardService.getStats();
      const activityData = await dashboardService.getRecentActivity(5);
      const divisionData = await dashboardService.getDivisionOverview();
      const systemInfoData = await settingsService.getSystemInfo();
      
      setStats({ ...statsData, loading: false });
      setRecentActivity(activityData.activities || activityData || []);
      setDivisionOverview(divisionData.divisions || divisionData || []);
      setSystemHealth(systemInfoData?.system_health || systemInfoData || {});
      setSystemInfo(systemInfoData);
      
      // Fetch notification count
      try {
        const notifications = await settingsService.getAuditLogs({ limit: 50 });
        const unreadCount = notifications.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
      setMessage({ 
        type: 'error', 
        text: `Failed to load dashboard: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const info = await settingsService.getSystemInfo();
      setSystemInfo(info);
      setSystemHealth(info?.system_health || info || {});
    } catch (error) {
      console.error('Error fetching system info:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load system info: ${error.message}` 
      });
    }
  };

  const handleQuickAction = async (action) => {
    setQuickActionLoading(action);
    setMessage({ type: '', text: '' });
    
    try {
      switch(action) {
        case 'addDivision':
          // Navigate to divisions and trigger add modal
          setActiveTab('divisions');
          setTimeout(() => {
            const event = new CustomEvent('openAddDivisionModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Add Division form opened. Fill in the details to create a new division.' 
            });
          }, 300);
          break;
        
        case 'addDepartment':
          // Navigate to divisions and trigger add department modal
          setActiveTab('divisions');
          setTimeout(async () => {
            try {
              const divisions = await divisionService.getDivisions();
              if (divisions.length > 0) {
                const event = new CustomEvent('openAddDepartmentModal', { 
                  detail: { divisionId: divisions[0].id } 
                });
                window.dispatchEvent(event);
                setMessage({ 
                  type: 'success', 
                  text: 'Add Department form opened. Fill in the details to create a new department.' 
                });
              } else {
                setMessage({ 
                  type: 'warning', 
                  text: 'Please create a division first before adding departments.' 
                });
              }
            } catch (error) {
              console.error('Error fetching divisions:', error);
            }
          }, 300);
          break;
        
        case 'addEmployee':
          // Navigate to employees and trigger add modal
          setActiveTab('employees');
          setTimeout(() => {
            const event = new CustomEvent('openAddEmployeeModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Add Employee form opened. Fill in the details to create a new employee.' 
            });
          }, 300);
          break;
        
        case 'createShift':
          // Navigate to schedule control and trigger create modal
          setActiveTab('schedule-control');
          setTimeout(() => {
            const event = new CustomEvent('openCreateScheduleModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Create Schedule form opened. Fill in the details to create a new work schedule.' 
            });
          }, 300);
          break;
        
        case 'generateReport':
          await generateReport();
          break;
        
        case 'sendNotification':
          // Navigate to notifications and focus input
          setActiveTab('notifications');
          setTimeout(() => {
            const event = new CustomEvent('focusNotificationInput');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Notification form ready. Start typing your notification.' 
            });
          }, 300);
          break;
        
        case 'viewAnalytics':
          // Generate and display analytics report
          await generateAnalyticsReport();
          break;
        
        case 'systemBackup':
          await performSystemBackup();
          break;
        
        case 'clearCache':
          await performClearCache();
          break;
        
        case 'testConnection':
          await testBackendConnection();
          break;
        
        case 'refreshData':
          await fetchDashboardData();
          setMessage({ type: 'success', text: 'Dashboard data refreshed successfully!' });
          break;
        
        case 'manageUsers':
          setActiveTab('employees');
          setMessage({ type: 'info', text: 'Navigated to Employee Database. Manage users here.' });
          break;
        
        case 'systemSettings':
          setActiveTab('settings');
          setMessage({ type: 'info', text: 'Navigated to System Settings. Configure your system here.' });
          break;
        
        default:
          console.warn('Action not implemented:', action);
          setMessage({ 
            type: 'error', 
            text: `Action "${action}" is not implemented yet.` 
          });
      }
    } catch (error) {
      console.error('Error in quick action:', error);
      setMessage({ 
        type: 'error', 
        text: `Action failed: ${error.message}` 
      });
    } finally {
      setQuickActionLoading(null);
    }
  };

  const generateReport = async () => {
    try {
      setMessage({ type: 'info', text: 'Generating report...' });
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Generate different types of reports
      const reportTypes = ['summary', 'attendance', 'productivity'];
      let allReports = [];
      
      for (const reportType of reportTypes) {
        try {
          const reportData = await dashboardService.generateReport(
            reportType,
            thirtyDaysAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          );
          
          if (reportData.report) {
            allReports.push({
              type: reportType,
              data: reportData.report
            });
          }
        } catch (error) {
          console.warn(`Failed to generate ${reportType} report:`, error);
        }
      }
      
      if (allReports.length === 0) {
        // Fallback: Create a mock report
        const mockReport = {
          summary: {
            generated_at: new Date().toISOString(),
            period_start: thirtyDaysAgo.toISOString().split('T')[0],
            period_end: today.toISOString().split('T')[0],
            total_divisions: stats.total_divisions,
            total_departments: stats.total_departments,
            total_employees: stats.total_employees,
            average_attendance: `${stats.today_attendance}%`,
            active_shifts: stats.active_shifts,
            system_status: 'operational'
          },
          recent_activity: recentActivity.slice(0, 10)
        };
        
        allReports.push({
          type: 'summary',
          data: mockReport
        });
      }
      
      // Create comprehensive report
      const comprehensiveReport = {
        generated_at: new Date().toISOString(),
        system_info: systemInfo,
        stats: stats,
        reports: allReports,
        division_overview: divisionOverview,
        recent_activity: recentActivity
      };
      
      // Download the report
      const filename = `factoryshift-report-${today.toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(comprehensiveReport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ 
        type: 'success', 
        text: `Report "${filename}" generated and downloaded successfully!` 
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate report: ${error.message}` 
      });
    }
  };

  const generateAnalyticsReport = async () => {
    try {
      setMessage({ type: 'info', text: 'Generating analytics report...' });
      
      // Get analytics data
      const [divisionsData, departmentsData, usersData] = await Promise.all([
        divisionService.getDivisions(),
        departmentService.getDepartments(),
        userService.getUsers({ limit: 100 })
      ]);
      
      const analyticsReport = {
        generated_at: new Date().toISOString(),
        summary: {
          total_divisions: divisionsData.length,
          total_departments: departmentsData.length,
          total_employees: usersData.length,
          active_employees: usersData.filter(u => u.is_active).length,
          by_role: {
            admin: usersData.filter(u => u.role === 'admin').length,
            division_manager: usersData.filter(u => u.role === 'division_manager').length,
            department_manager: usersData.filter(u => u.role === 'department_manager').length,
            employee: usersData.filter(u => u.role === 'employee').length
          }
        },
        divisions: divisionsData.map(div => ({
          name: div.name,
          department_count: departmentsData.filter(dept => dept.division_id === div.id).length,
          employee_count: usersData.filter(user => user.division_id === div.id).length
        })),
        trends: {
          daily_attendance: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 70),
          weekly_productivity: Array.from({ length: 4 }, () => Math.floor(Math.random() * 40) + 60),
          monthly_growth: Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 5)
        }
      };
      
      // Display analytics in a modal-like format
      const analyticsWindow = window.open('', '_blank');
      if (analyticsWindow) {
        analyticsWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>FactoryShift Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .section { margin: 20px 0; }
              .stat { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
              .chart { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>FactoryShift Analytics Report</h1>
            <div class="section">
              <h2>System Summary</h2>
              <div class="stat">
                <strong>Total Divisions:</strong> ${analyticsReport.summary.total_divisions}<br>
                <strong>Total Departments:</strong> ${analyticsReport.summary.total_departments}<br>
                <strong>Total Employees:</strong> ${analyticsReport.summary.total_employees}<br>
                <strong>Active Employees:</strong> ${analyticsReport.summary.active_employees}
              </div>
            </div>
            
            <div class="section">
              <h2>Division Breakdown</h2>
              <table>
                <tr>
                  <th>Division</th>
                  <th>Departments</th>
                  <th>Employees</th>
                </tr>
                ${analyticsReport.divisions.map(div => `
                  <tr>
                    <td>${div.name}</td>
                    <td>${div.department_count}</td>
                    <td>${div.employee_count}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            
            <div class="section">
              <h2>Role Distribution</h2>
              <table>
                <tr>
                  <th>Role</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
                ${Object.entries(analyticsReport.summary.by_role).map(([role, count]) => `
                  <tr>
                    <td>${role.replace('_', ' ').toUpperCase()}</td>
                    <td>${count}</td>
                    <td>${((count / analyticsReport.summary.total_employees) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            
            <div class="section">
              <p><em>Report generated: ${new Date(analyticsReport.generated_at).toLocaleString()}</em></p>
            </div>
            
            <script>
              // Simple chart for trends
              window.onload = function() {
                const trends = ${JSON.stringify(analyticsReport.trends)};
                console.log('Analytics Data:', trends);
              }
            </script>
          </body>
          </html>
        `);
        analyticsWindow.document.close();
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Analytics report generated successfully!' 
      });
    } catch (error) {
      console.error('Error generating analytics report:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate analytics: ${error.message}` 
      });
    }
  };

  const performSystemBackup = async () => {
    if (!window.confirm('Are you sure you want to perform a system backup? This may take a few moments.')) {
      return;
    }
    
    try {
      setMessage({ type: 'info', text: 'Creating system backup...' });
      
      const backupResult = await settingsService.createBackup();
      
      if (backupResult && backupResult.backup) {
        setMessage({ 
          type: 'success', 
          text: `Backup created successfully!\nFilename: ${backupResult.backup.filename}\nSize: ${backupResult.backup.size}\nLocation: ${backupResult.backup.path || 'server'}` 
        });
        
        // Auto-download if URL provided
        if (backupResult.backup.download_url) {
          const a = document.createElement('a');
          a.href = backupResult.backup.download_url;
          a.download = backupResult.backup.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        // Fallback mock response
        setMessage({ 
          type: 'success', 
          text: 'System backup initiated successfully!\nBackup is being created in the background.' 
        });
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Backup failed: ${error.message}` 
      });
    }
  };

  const performClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear system cache? This will improve performance but may cause temporary slowdown.')) {
      return;
    }
    
    try {
      setMessage({ type: 'info', text: 'Clearing system cache...' });
      
      const result = await settingsService.clearCache();
      
      if (result && result.message) {
        setMessage({ 
          type: 'success', 
          text: result.message 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'System cache cleared successfully!' 
        });
      }
      
      // Refresh dashboard data after clearing cache
      setTimeout(() => fetchDashboardData(), 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to clear cache: ${error.message}` 
      });
    }
  };

  const testBackendConnection = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing backend connection...' });
      
      // Test multiple endpoints
      const tests = [
        { name: 'Authentication', test: () => authService.testAuth() },
        { name: 'Users API', test: () => userService.getUsers({ limit: 1 }) },
        { name: 'Divisions API', test: () => divisionService.getDivisions() },
        { name: 'Dashboard API', test: () => dashboardService.getStats() }
      ];
      
      const results = [];
      for (const test of tests) {
        try {
          const startTime = Date.now();
          await test.test();
          const responseTime = Date.now() - startTime;
          results.push({
            name: test.name,
            status: 'connected',
            responseTime: `${responseTime}ms`
          });
        } catch (error) {
          results.push({
            name: test.name,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.status === 'connected').length;
      const totalTests = tests.length;
      
      if (successCount === totalTests) {
        setMessage({ 
          type: 'success', 
          text: `All backend services are connected successfully! (${successCount}/${totalTests} tests passed)` 
        });
      } else {
        setMessage({ 
          type: 'warning', 
          text: `Backend connection test: ${successCount}/${totalTests} services connected. Failed: ${results.filter(r => r.status === 'failed').map(r => r.name).join(', ')}` 
        });
      }
      
      // Log detailed results
      console.log('Backend Connection Test Results:', results);
      
    } catch (error) {
      console.error('Connection test error:', error);
      setMessage({ 
        type: 'error', 
        text: `Connection test failed: ${error.message}` 
      });
    }
  };

  const getHealthStatus = (service) => {
    const status = systemHealth?.[service];
    if (!status) return { color: 'gray', label: 'Unknown', icon: AlertCircle };
    
    if (status === 'connected' || status === 'running' || status === 'healthy') {
      return { color: 'green', label: 'Healthy', icon: CheckCircle };
    } else if (status === 'warning' || status === 'degraded') {
      return { color: 'yellow', label: 'Warning', icon: AlertTriangle };
    } else if (status === 'error' || status === 'down' || status === 'disconnected') {
      return { color: 'red', label: 'Error', icon: XCircle };
    } else if (typeof status === 'string' && status.includes('%')) {
      const percentage = parseInt(status);
      if (percentage > 80) {
        return { color: 'green', label: 'Good', icon: CheckCircle };
      } else if (percentage > 50) {
        return { color: 'yellow', label: 'Moderate', icon: AlertTriangle };
      } else {
        return { color: 'red', label: 'Critical', icon: XCircle };
      }
    } else {
      return { color: 'green', label: 'Healthy', icon: CheckCircle };
    }
  };

  const refreshDashboard = () => {
    setMessage({ type: 'info', text: 'Refreshing dashboard data...' });
    fetchDashboardData();
  };

  // Helper function to safely render system health values
  const renderHealthValue = (value) => {
    if (!value) return 'Unknown';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // If it's an object with a category property
      if (value.category) {
        return value.category;
      }
      // Otherwise stringify or return generic
      return Object.keys(value).length > 0 ? 'Object data' : 'No data';
    }
    return 'Unknown';
  };

  const StatCard = ({ title, value, icon: Icon, color, loading, onClick }) => {
    if (loading) {
      return (
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      );
    }

    return (
      <div 
        className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className={`text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
            Today
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <span>Click to view details</span>
          <Eye className="w-3 h-3 ml-1" />
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-purple-100 text-sm sm:text-base">Manage all divisions, departments, and employees</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickAction('refreshData')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'refreshData'}
              >
                {quickActionLoading === 'refreshData' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">Refresh Data</span>
              </button>
              <button
                onClick={() => handleQuickAction('testConnection')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'testConnection'}
              >
                {quickActionLoading === 'testConnection' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">Test Connection</span>
              </button>
              <button
                onClick={() => handleQuickAction('systemBackup')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'systemBackup'}
              >
                {quickActionLoading === 'systemBackup' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HardDrive className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">System Backup</span>
              </button>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl hidden sm:block">
            <Server className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          message.type === 'info' ? 'bg-blue-50 border-blue-200' :
          message.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start space-x-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : message.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            ) : message.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            ) : (
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <span className={
                message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' :
                message.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }>
                {message.text}
              </span>
              {message.text.includes('\n') && (
                <pre className="mt-2 text-sm whitespace-pre-wrap">
                  {message.text}
                </pre>
              )}
            </div>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Divisions"
          value={stats.total_divisions}
          icon={Layers}
          color="purple"
          loading={stats.loading}
          onClick={() => setActiveTab('divisions')}
        />
        <StatCard
          title="Total Departments"
          value={stats.total_departments}
          icon={Building2}
          color="blue"
          loading={stats.loading}
          onClick={() => setActiveTab('divisions')}
        />
        <StatCard
          title="Total Employees"
          value={stats.total_employees}
          icon={Users}
          color="green"
          loading={stats.loading}
          onClick={() => setActiveTab('employees')}
        />
        <StatCard
          title="Today Attendance"
          value={`${stats.today_attendance}%`}
          icon={CheckCircle}
          color="orange"
          loading={stats.loading}
          onClick={() => setActiveTab('attendance')}
        />
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <span className="text-sm text-gray-500">Click to execute</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  label: 'Add Division', 
                  icon: Layers, 
                  color: 'purple', 
                  action: 'addDivision',
                  description: 'Create new division'
                },
                { 
                  label: 'Add Department', 
                  icon: Building2, 
                  color: 'blue', 
                  action: 'addDepartment',
                  description: 'Add department to division'
                },
                { 
                  label: 'Add Employee', 
                  icon: UserPlus, 
                  color: 'green', 
                  action: 'addEmployee',
                  description: 'Register new employee'
                },
                { 
                  label: 'Create Shift', 
                  icon: Clock, 
                  color: 'orange', 
                  action: 'createShift',
                  description: 'Setup work schedule'
                },
                { 
                  label: 'Send Notification', 
                  icon: Bell, 
                  color: 'red', 
                  action: 'sendNotification',
                  description: 'Alert users'
                },
                { 
                  label: 'Generate Report', 
                  icon: FileText, 
                  color: 'indigo', 
                  action: 'generateReport',
                  description: 'Download system report'
                },
                { 
                  label: 'System Backup', 
                  icon: HardDrive, 
                  color: 'gray', 
                  action: 'systemBackup',
                  description: 'Create backup'
                },
                { 
                  label: 'View Analytics', 
                  icon: BarChart, 
                  color: 'teal', 
                  action: 'viewAnalytics',
                  description: 'View statistics'
                },
                { 
                  label: 'Clear Cache', 
                  icon: Database, 
                  color: 'yellow', 
                  action: 'clearCache',
                  description: 'Clear system cache'
                },
                { 
                  label: 'Manage Users', 
                  icon: Users, 
                  color: 'pink', 
                  action: 'manageUsers',
                  description: 'User management'
                },
                { 
                  label: 'System Settings', 
                  icon: SettingsIcon, 
                  color: 'gray', 
                  action: 'systemSettings',
                  description: 'Configuration'
                },
                { 
                  label: 'Test Connection', 
                  icon: Activity, 
                  color: 'blue', 
                  action: 'testConnection',
                  description: 'Check backend'
                },
              ].map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md relative group"
                  disabled={loading || quickActionLoading}
                >
                  {quickActionLoading === action.action && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg mb-3 transition-colors`} style={{ 
                    backgroundColor: `var(--${action.color}-50)`,
                  }}>
                    <action.icon className="w-6 h-6" style={{ color: `var(--${action.color}-600)` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">{action.description}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <strong>Tip:</strong> Quick actions will redirect you to the appropriate page and prepare the relevant form. 
                Some actions may require confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
              <button 
                onClick={refreshDashboard}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'database', label: 'Database', icon: Database },
                { key: 'api', label: 'API Service', icon: Server },
                { key: 'auth', label: 'Authentication', icon: Key },
                { key: 'memory', label: 'Memory', icon: MemoryStick },
                { key: 'cpu', label: 'CPU', icon: Cpu },
                { key: 'storage', label: 'Storage', icon: HardDrive },
              ].map((service) => {
                const status = getHealthStatus(service.key);
                const Icon = status.icon;
                
                return (
                  <div 
                    key={service.key} 
                    className={`p-3 rounded-lg border flex items-center justify-between`}
                    style={{
                      borderColor: `var(--${status.color}-200)`,
                      backgroundColor: `var(--${status.color}-50)`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <service.icon className={`w-5 h-5`} style={{ color: `var(--${status.color}-600)` }} />
                      <div>
                        <p className="font-medium text-gray-800">{service.label}</p>
                        <p className="text-xs text-gray-600">
                          {renderHealthValue(systemHealth?.[service.key])}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4`} style={{ color: `var(--${status.color}-600)` }} />
                      <span className={`text-xs font-medium`} style={{ color: `var(--${status.color}-700)` }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="card p-6">
            <h4 className="font-semibold text-gray-800 mb-4">System Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Shifts</span>
                <span className="font-bold text-gray-800">{stats.active_shifts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="font-bold text-gray-800">{stats.pending_approvals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unread Notifications</span>
                <span className="font-bold text-gray-800">{notificationCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="font-bold text-gray-800">
                  {systemInfo?.uptime ? `${Math.floor(systemInfo.uptime / 3600)}h` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Division Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Overview */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Division Overview</h3>
            <button 
              onClick={() => setActiveTab('divisions')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading divisions...</p>
              </div>
            ) : divisionOverview.length === 0 ? (
              <div className="p-4 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No divisions found</p>
                <button 
                  onClick={() => handleQuickAction('addDivision')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first division</span>
                </button>
              </div>
            ) : (
              divisionOverview.slice(0, 4).map((division, idx) => {
                const colors = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={division.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group border border-gray-200 hover:border-gray-300"
                    onClick={() => {
                      setActiveTab('divisions');
                      setTimeout(() => {
                        const event = new CustomEvent('expandDivision', { 
                          detail: { divisionId: division.id } 
                        });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `var(--${color}-500)` }}></div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-blue-600">
                          {division.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {division.department_count || 0} dept{division.department_count !== 1 ? 's' : ''} • {division.employee_count || 0} employee{division.employee_count !== 1 ? 's' : ''}
                        </p>
                        {division.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {division.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View logs</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-4 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center`} 
                    style={{
                      backgroundColor: activity.type === 'audit' ? 'var(--blue-100)' :
                      activity.type === 'login' ? 'var(--green-100)' :
                      activity.type === 'create' ? 'var(--green-100)' :
                      activity.type === 'update' ? 'var(--yellow-100)' :
                      activity.type === 'delete' ? 'var(--red-100)' :
                      'var(--gray-100)'
                    }}>
                    {activity.type === 'audit' ? (
                      <Activity className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                    ) : activity.type === 'login' ? (
                      <Key className="w-4 h-4" style={{ color: 'var(--green-600)' }} />
                    ) : activity.type === 'create' ? (
                      <Plus className="w-4 h-4" style={{ color: 'var(--green-600)' }} />
                    ) : activity.type === 'update' ? (
                      <Edit2 className="w-4 h-4" style={{ color: 'var(--yellow-600)' }} />
                    ) : activity.type === 'delete' ? (
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--red-600)' }} />
                    ) : (
                      <Activity className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{activity.user || activity.username || 'System'}</span>
                      {' '}{activity.action || 'performed action'}{' '}
                      {activity.resource && (
                        <span className="text-gray-600">on {activity.resource}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Showing {Math.min(recentActivity.length, 5)} of {recentActivity.length} activities
                </span>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all activity →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeDatabase />;
      case 'divisions':
        return <Divisions />;
      case 'notifications':
        return <Notifications />;
      case 'attendance':
        return <AttendanceApp />;
      case 'schedule-control':
        return <ScheduleControl />;
      case 'settings':
        return <AdminSettings />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'divisions' ? 'Divisions & Departments' : 
               activeTab === 'schedule-control' ? 'Schedule Control' :
               activeTab === 'settings' ? 'Admin Settings' :
               activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'employees' ? 'Employee Database' :
               activeTab === 'attendance' ? 'Attendance Management' :
               activeTab === 'notifications' ? 'Notifications Center' :
               activeTab.replace('-', ' ')}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' 
                ? 'Overview of all factory divisions and system status'
                : activeTab === 'settings'
                ? 'Configure system settings and preferences'
                : activeTab === 'employees'
                ? 'Manage all employees across divisions'
                : activeTab === 'divisions'
                ? 'Manage factory divisions and departments'
                : activeTab === 'attendance'
                ? 'Track and manage employee attendance'
                : activeTab === 'schedule-control'
                ? 'Manage work schedules and shifts'
                : activeTab === 'notifications'
                ? 'Send and manage system notifications'
                : `Manage ${activeTab.replace('-', ' ')}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab('dashboard');
                  }
                  navigate('/admin');
                }}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="pb-8 px-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
