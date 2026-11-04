from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth.dependencies import get_current_user
from app.models.schemas import ProfileUpdateRequest

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("/profile")
def get_student_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    profile = db.query_one("""
        SELECT sp.*, cp.title as target_career_title, cp.icon_name as target_career_icon
        FROM student_profiles sp
        LEFT JOIN career_paths cp ON sp.target_career_id = cp.id
        WHERE sp.user_id = ?
    """, (user_id,))
    
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    # Get skill statistics
    skills_count = db.query_one("SELECT COUNT(*) as count FROM student_skills WHERE user_id = ?", (user_id,))["count"]
    avg_rating = db.query_one("SELECT AVG(rating) as avg FROM student_skills WHERE user_id = ?", (user_id,))["avg"] or 0.0

    return {
        "user": current_user,
        "profile": profile,
        "stats": {
            "total_skills_logged": skills_count,
            "average_skill_rating": round(avg_rating, 1)
        }
    }

@router.put("/profile")
def update_student_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    if req.full_name:
        db.execute("UPDATE users SET full_name = ? WHERE id = ?", (req.full_name.strip(), user_id))
        
    profile_updates = []
    params = []
    
    fields = [
        ("college_name", req.college_name),
        ("degree", req.degree),
        ("branch", req.branch),
        ("current_academic_year", req.current_academic_year),
        ("graduation_year", req.graduation_year),
        ("bio", req.bio),
        ("github_url", req.github_url),
        ("linkedin_url", req.linkedin_url),
        ("available_hours_per_week", req.available_hours_per_week),
    ]
    
    for col, val in fields:
        if val is not None:
            profile_updates.append(f"{col} = ?")
            params.append(val)
            
    if profile_updates:
        params.append(user_id)
        sql = f"UPDATE student_profiles SET {', '.join(profile_updates)}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
        db.execute(sql, tuple(params))
        
    return get_student_profile(current_user)
