from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine
from app import models
from app.api.v1 import auth, users, divisions, departments

# Create tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created")
    yield
    # Shutdown
    print("Shutting down")

app = FastAPI(
    title="FactoryShift API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(divisions.router, prefix="/api/v1/divisions", tags=["Divisions"])
app.include_router(departments.router, prefix="/api/v1/departments", tags=["Departments"])

@app.get("/")
def read_root():
    return {"message": "FactoryShift API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}