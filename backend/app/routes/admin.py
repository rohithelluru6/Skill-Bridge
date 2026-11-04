import json
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth.dependencies import require_admin
from app.models.schemas import AdminCareerCreateRequest, AdminSkillCreateRequest

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/students")
def get_all_students(admin_user: dict = Depends(require_admin)):
    """Returns all registered student profiles with their targets and progress."""
    students = db.query("""
        SELECT u.id, u.email, u.full_name, u.created_at,
               sp.college_name, sp.degree, sp.branch, sp.current_academic_year, sp.graduation_year,
               cp.title as target_career,
               (SELECT COUNT(*) FROM student_skills ss WHERE ss.user_id = u.id) as skills_count,
               (SELECT overall_readiness_score FROM skill_gap_analyses sga WHERE sga.user_id = u.id ORDER BY sga.created_at DESC LIMIT 1) as readiness_score
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN career_paths cp ON sp.target_career_id = cp.id
        WHERE u.role = 'student'
        ORDER BY u.created_at DESC
    """)
    return {"students": students, "total": len(students)}

@router.post("/careers")
def create_career_path(req: AdminCareerCreateRequest, admin_user: dict = Depends(require_admin)):
    """Creates a new career category and associates required skills."""
    existing = db.query_one("SELECT id FROM career_paths WHERE LOWER(title) = LOWER(?) OR LOWER(slug) = LOWER(?)", (req.title, req.slug))
    if existing:
        raise HTTPException(status_code=400, detail="Career path with this title or slug already exists.")
        
    cid = db.execute("""
        INSERT INTO career_paths (title, slug, category, description, industry_expectations, average_salary_range, demand_level, icon_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.title.strip(),
        req.slug.strip().lower(),
        req.category.strip(),
        req.description.strip(),
        req.industry_expectations.strip(),
        req.average_salary_range,
        req.demand_level,
        req.icon_name
    ))
    
    # Associate required skills if provided
    for item in req.required_skills:
        skill_id = item.get("skill_id")
        req_level = float(item.get("required_level", 3.0))
        importance = item.get("importance", "Required")
        if skill_id:
            db.execute("""
                INSERT INTO career_required_skills (career_id, skill_id, required_level, importance)
                VALUES (?, ?, ?, ?)
            """, (cid, skill_id, req_level, importance))
            
    career = db.query_one("SELECT * FROM career_paths WHERE id = ?", (cid,))
    return {"career": career, "message": "Career path created successfully."}

@router.post("/skills")
def create_skill(req: AdminSkillCreateRequest, admin_user: dict = Depends(require_admin)):
    """Creates an administrative skill in the master catalog."""
    existing = db.query_one("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (req.name.strip(),))
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists.")
        
    sid = db.execute("""
        INSERT INTO skills (name, category, description)
        VALUES (?, ?, ?)
    """, (req.name.strip(), req.category, req.description))
    
    skill = db.query_one("SELECT * FROM skills WHERE id = ?", (sid,))
    return {"skill": skill, "message": "Skill added to catalog."}

@router.get("/analytics")
def get_admin_analytics(admin_user: dict = Depends(require_admin)):
    """Returns platform health metrics and trends."""
    total_students = db.query_one("SELECT COUNT(*) as count FROM users WHERE role = 'student'")["count"]
    total_careers = db.query_one("SELECT COUNT(*) as count FROM career_paths WHERE is_active = 1")["count"]
    total_skills = db.query_one("SELECT COUNT(*) as count FROM skills")["count"]
    total_assessments = db.query_one("SELECT COUNT(*) as count FROM assessment_results")["count"]
    
    avg_readiness = db.query_one("SELECT AVG(overall_readiness_score) as avg FROM skill_gap_analyses")["avg"] or 0.0

    # Most popular target careers
    popular_careers = db.query("""
        SELECT cp.title, COUNT(sp.id) as student_count
        FROM career_paths cp
        LEFT JOIN student_profiles sp ON cp.id = sp.target_career_id
        GROUP BY cp.id
        ORDER BY student_count DESC
        LIMIT 5
    """)

    # Branch distribution
    branch_distribution = db.query("""
        SELECT branch, COUNT(*) as count
        FROM student_profiles
        GROUP BY branch
        ORDER BY count DESC
    """)

    return {
        "metrics": {
            "total_students": total_students,
            "total_careers": total_careers,
            "total_skills": total_skills,
            "total_assessments_taken": total_assessments,
            "platform_average_readiness": round(avg_readiness, 1)
        },
        "popular_careers": popular_careers,
        "branch_distribution": branch_distribution
    }
