import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from app.database import db
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.models.schemas import (
    GapAnalysisRequest,
    RoadmapGenerateRequest,
    ResourceRecommendRequest,
    ResourceSearchRequest
)
from app.services.ai_service import analyze_skill_gap_ai, generate_career_roadmap_ai
from app.services.resource_search_service import search_learning_resources_ai

router = APIRouter(prefix="/api/ai", tags=["AI & Recommendations"])

@router.post("/skill-gap-analysis")
async def get_skill_gap_analysis(req: GapAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Computes AI-assisted skill gap analysis comparing student's abilities to industry demands."""
    user_id = current_user["id"]
    career_id = req.career_id
    
    # If career_id not provided, look up student's target career
    if not career_id:
        profile = db.query_one("SELECT target_career_id FROM student_profiles WHERE user_id = ?", (user_id,))
        if profile and profile.get("target_career_id"):
            career_id = profile["target_career_id"]
        else:
            # Default to first available career
            first_career = db.query_one("SELECT id FROM career_paths ORDER BY id ASC LIMIT 1")
            if first_career:
                career_id = first_career["id"]
            else:
                raise HTTPException(status_code=400, detail="No career paths available in database.")
                
    result = await analyze_skill_gap_ai(user_id, career_id)
    return result

@router.post("/generate-roadmap")
async def generate_career_roadmap(req: RoadmapGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Generates an actionable 5-phase personalized learning roadmap."""
    user_id = current_user["id"]
    career_id = req.career_id
    
    profile = db.query_one("SELECT target_career_id, available_hours_per_week FROM student_profiles WHERE user_id = ?", (user_id,))
    if not career_id:
        if profile and profile.get("target_career_id"):
            career_id = profile["target_career_id"]
        else:
            first_career = db.query_one("SELECT id FROM career_paths ORDER BY id ASC LIMIT 1")
            career_id = first_career["id"] if first_career else 1

    hours = req.available_hours_per_week or (profile.get("available_hours_per_week") if profile else 15) or 15

    # Check if active roadmap already exists and user did not request force_regenerate
    if not req.force_regenerate:
        existing = db.query_one("SELECT * FROM roadmaps WHERE user_id = ? AND career_id = ? AND is_active = 1", (user_id, career_id))
        if existing:
            # Fetch tasks
            tasks = db.query("SELECT * FROM roadmap_tasks WHERE roadmap_id = ? ORDER BY phase_number ASC, order_index ASC", (existing["id"],))
            
            # Group into phases
            phases_map = {}
            for t in tasks:
                p_num = t["phase_number"]
                if p_num not in phases_map:
                    phases_map[p_num] = {
                        "phase_number": p_num,
                        "phase_title": t["phase_title"],
                        "tasks": []
                    }
                phases_map[p_num]["tasks"].append(t)
                
            completed = sum(1 for t in tasks if t["is_completed"])
            total = len(tasks)
            pct = round((completed / total * 100), 1) if total > 0 else 0.0

            career = db.query_one("SELECT title FROM career_paths WHERE id = ?", (career_id,))
            return {
                "roadmap_id": existing["id"],
                "career_id": career_id,
                "career_title": career["title"] if career else "Career Path",
                "title": existing["title"],
                "overview": existing["overview"],
                "estimated_duration_weeks": existing["estimated_duration_weeks"],
                "phases": list(phases_map.values()),
                "total_tasks": total,
                "completed_tasks": completed,
                "progress_percentage": pct,
                "is_cached": True
            }

    # Generate fresh
    roadmap = await generate_career_roadmap_ai(user_id, career_id, hours)
    return roadmap

@router.post("/recommend-resources")
def recommend_resources(req: ResourceRecommendRequest, current_user: dict = Depends(get_current_user)):
    """Recommends vetted learning materials for missing or gap skills."""
    user_id = current_user["id"]
    skill_ids = req.skill_ids
    
    if not skill_ids:
        # Pull student's lowest rated skills or career gaps
        career_id = req.career_id
        if not career_id:
            profile = db.query_one("SELECT target_career_id FROM student_profiles WHERE user_id = ?", (user_id,))
            career_id = profile.get("target_career_id") if profile else None
            
        if career_id:
            gap_skills = db.query("""
                SELECT crs.skill_id
                FROM career_required_skills crs
                LEFT JOIN student_skills ss ON crs.skill_id = ss.skill_id AND ss.user_id = ?
                WHERE crs.career_id = ? AND (ss.rating IS NULL OR ss.rating < crs.required_level)
                ORDER BY crs.required_level DESC
                LIMIT 5
            """, (user_id, career_id))
            skill_ids = [row["skill_id"] for row in gap_skills]
            
    if not skill_ids:
        # Fallback to high priority skills in catalog
        top_skills = db.query("SELECT id FROM skills LIMIT 5")
        skill_ids = [s["id"] for s in top_skills]
        
    placeholders = ','.join('?' for _ in skill_ids)
    resources = db.query(f"""
        SELECT lr.*, s.name as skill_name, s.category as skill_category
        FROM learning_resources lr
        JOIN skills s ON lr.skill_id = s.id
        WHERE lr.skill_id IN ({placeholders})
        ORDER BY lr.difficulty ASC, s.name ASC
    """, tuple(skill_ids))
    
    return {"resources": resources, "evaluated_skills_count": len(skill_ids)}


@router.get("/search-resources/status")
async def get_resource_search_status(
    visitor_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Checks if the visitor has free AI searches remaining.
    Authenticated users enjoy unlimited searches.
    Anonymous users have 1 free search, tracked in the database.
    """
    if current_user:
        return {
            "authenticated": True,
            "search_count": 0,
            "remaining_searches": 999,
            "limit_reached": False,
            "message": "Authenticated student - unlimited AI resource searches."
        }

    clean_visitor_id = (visitor_id or "").strip()
    if not clean_visitor_id:
        return {
            "authenticated": False,
            "search_count": 0,
            "remaining_searches": 1,
            "limit_reached": False,
            "message": "1 free AI resource search available."
        }

    record = db.query_one(
        "SELECT search_count FROM anonymous_resource_searches WHERE visitor_id = ?",
        (clean_visitor_id,)
    )
    count = record["search_count"] if record else 0
    limit_reached = count >= 1

    return {
        "authenticated": False,
        "search_count": count,
        "remaining_searches": max(0, 1 - count),
        "limit_reached": limit_reached,
        "message": (
            "Your free AI resource search has been used! Register or log in to Skill Bridge to unlock unlimited access to personalized learning resources."
            if limit_reached
            else "1 free AI resource search available."
        )
    }


@router.post("/search-resources")
async def search_resources(
    req: ResourceSearchRequest,
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    AI-powered learning resource search.
    - Authenticated users: unlimited searches.
    - Unregistered / anonymous visitors: exactly ONE free search tracked in database.
    - If anonymous visitor exceeds 1 search: rejected with 403 Forbidden.
    """
    if not req.skill or not req.skill.strip():
        raise HTTPException(status_code=400, detail="Skill is required to search learning resources.")

    visitor_id = (req.visitor_id or "").strip()
    if not visitor_id:
        # Fallback to header or client IP
        visitor_id = request.headers.get("x-visitor-id") or (request.client.host if request.client else "unknown_visitor")

    # If unauthenticated, enforce strict 1-time search limit via database
    if not current_user:
        record = db.query_one(
            "SELECT search_count FROM anonymous_resource_searches WHERE visitor_id = ?",
            (visitor_id,)
        )
        if record and record["search_count"] >= 1:
            raise HTTPException(
                status_code=403,
                detail="Your free AI resource search has been used! Register or log in to Skill Bridge to unlock unlimited access to personalized learning resources."
            )

        # Record / increment usage in database
        if record:
            db.execute(
                "UPDATE anonymous_resource_searches SET search_count = search_count + 1, last_search_at = CURRENT_TIMESTAMP WHERE visitor_id = ?",
                (visitor_id,)
            )
        else:
            db.execute(
                "INSERT INTO anonymous_resource_searches (visitor_id, search_count, last_search_at) VALUES (?, 1, CURRENT_TIMESTAMP)",
                (visitor_id,)
            )

    # Perform AI search
    resources = await search_learning_resources_ai(req.skill, req.topic)

    return {
        "resources": resources,
        "skill": req.skill.strip(),
        "topic": (req.topic or "").strip(),
        "is_authenticated": bool(current_user),
        "remaining_searches": 999 if current_user else 0,
        "total_results": len(resources)
    }
