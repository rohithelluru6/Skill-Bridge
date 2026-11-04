import time
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.auth.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.auth.dependencies import get_current_user
from app.models.schemas import RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    # Check if email exists
    existing = db.query_one("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (req.email,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pw = get_password_hash(req.password)
    user_id = db.execute("""
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (?, ?, ?, 'student')
    """, (req.email.lower().strip(), hashed_pw, req.full_name.strip()))
    
    # Create student profile
    db.execute("""
        INSERT INTO student_profiles (
            user_id, college_name, degree, branch, current_academic_year, graduation_year, available_hours_per_week
        ) VALUES (?, ?, ?, ?, ?, ?, 15)
    """, (
        user_id,
        req.college_name.strip(),
        req.degree.strip(),
        req.branch.strip(),
        req.current_academic_year.strip(),
        req.graduation_year
    ))
    
    # Record progress event
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description)
        VALUES (?, 'ACCOUNT_CREATED', 'Student registered for Skill Bridge')
    """, (user_id,))
    
    token = create_access_token({"user_id": user_id, "email": req.email, "role": "student"})
    user = db.query_one("SELECT id, email, full_name, role, created_at FROM users WHERE id = ?", (user_id,))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
        "message": "Registration successful! Welcome to Skill Bridge."
    }

@router.post("/login")
def login(req: LoginRequest):
    user = db.query_one("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (req.email.strip(),))
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )
        
    token = create_access_token({"user_id": user["id"], "email": user["email"], "role": user["role"]})
    user_data = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "created_at": user["created_at"]
    }
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data,
        "message": "Login successful!"
    }

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    # With stateless JWT tokens, client clears its local storage.
    return {"message": "Logged out successfully."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = db.query_one("SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(?)", (req.email.strip(),))
    if not user:
        # Prevent account enumeration: return success regardless
        return {
            "message": "If an account exists with this email, password reset instructions have been generated.",
            "demo_reset_token": None
        }
        
    # Generate reset token with 15-minute expiration
    reset_token = create_access_token({"user_id": user["id"], "purpose": "password_reset"}, expires_delta_seconds=900)
    
    return {
        "message": "Password reset token created successfully. In demo mode, token is returned for instant testing.",
        "demo_reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    payload = decode_access_token(req.token)
    if not payload or payload.get("purpose") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    user_id = payload.get("user_id")
    hashed_pw = get_password_hash(req.new_password)
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed_pw, user_id))
    
    return {"message": "Password has been successfully updated. You may now log in with your new credentials."}

@router.get("/me")
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    profile = db.query_one("SELECT * FROM student_profiles WHERE user_id = ?", (current_user["id"],))
    return {
        "user": current_user,
        "profile": profile
    }
