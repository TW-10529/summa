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
