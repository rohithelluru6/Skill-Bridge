import json
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth.dependencies import get_current_user
from app.models.schemas import CareerSelectRequest

router = APIRouter(prefix="/api/careers", tags=["Careers"])

@router.get("")
def get_career_paths():
    """Returns list of all available career paths."""
    careers = db.query("""
        SELECT cp.*, COUNT(crs.id) as required_skills_count
        FROM career_paths cp
        LEFT JOIN career_required_skills crs ON cp.id = crs.career_id
        WHERE cp.is_active = 1
        GROUP BY cp.id
        ORDER BY cp.title ASC
    """)
    return {"careers": careers}

@router.get("/{career_id}")
def get_career_details(career_id: int):
    """Returns comprehensive details for a specific career path."""
    career = db.query_one("SELECT * FROM career_paths WHERE id = ?", (career_id,))
    if not career:
        raise HTTPException(status_code=404, detail="Career path not found.")
        
    # Required skills
    required_skills = db.query("""
        SELECT crs.skill_id, crs.required_level, crs.importance,
               s.name, s.category, s.description
        FROM career_required_skills crs
        JOIN skills s ON crs.skill_id = s.id
        WHERE crs.career_id = ?
        ORDER BY s.category ASC, crs.importance DESC, crs.required_level DESC
    """, (career_id,))
    
    # Project recommendations
    projects_rows = db.query("""
        SELECT * FROM project_recommendations WHERE career_id = ? ORDER BY
        CASE difficulty
            WHEN 'Beginner' THEN 1
            WHEN 'Intermediate' THEN 2
            WHEN 'Advanced' THEN 3
            ELSE 4
        END
    """, (career_id,))
    
    projects = []
    for p in projects_rows:
        projects.append({
            "id": p["id"],
            "title": p["title"],
            "difficulty": p["difficulty"],
            "description": p["description"],
            "technologies_required": json.loads(p["technologies_required"]) if isinstance(p["technologies_required"], str) else p["technologies_required"],
            "learning_outcomes": json.loads(p["learning_outcomes"]) if isinstance(p["learning_outcomes"], str) else p["learning_outcomes"],
            "github_starter_url": p["github_starter_url"],
            "estimated_hours": p["estimated_hours"]
        })
        
    # Learning resources mapped to this career's required skills
    skill_ids = [s["skill_id"] for s in required_skills]
    resources = []
    if skill_ids:
        placeholders = ','.join('?' for _ in skill_ids)
        res_rows = db.query(f"""
            SELECT lr.*, s.name as skill_name
            FROM learning_resources lr
            JOIN skills s ON lr.skill_id = s.id
            WHERE lr.skill_id IN ({placeholders})
            ORDER BY s.name ASC, lr.difficulty ASC
        """, tuple(skill_ids))
        resources = res_rows

    return {
        "career": career,
        "required_skills": required_skills,
        "projects": projects,
        "resources": resources
    }

@router.post("/select-goal")
def select_career_goal(req: CareerSelectRequest, current_user: dict = Depends(get_current_user)):
    """Sets or updates the student's primary career goal."""
    user_id = current_user["id"]
    career = db.query_one("SELECT id, title FROM career_paths WHERE id = ?", (req.career_id,))
    if not career:
        raise HTTPException(status_code=404, detail="Selected career does not exist.")
        
    db.execute("""
        UPDATE student_profiles
        SET target_career_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    """, (req.career_id, user_id))
    
    # Log progress record
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description, metrics)
        VALUES (?, 'CAREER_GOAL_SELECTED', ?, ?)
    """, (user_id, f"Selected career target: {career['title']}", json.dumps({"career_id": req.career_id})))

    return {
        "message": f"Successfully set target career to '{career['title']}'!",
        "target_career_id": req.career_id,
        "target_career_title": career["title"]
    }
