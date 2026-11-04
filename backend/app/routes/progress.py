import json
from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.auth.dependencies import get_current_user
from app.models.schemas import TaskToggleRequest

router = APIRouter(prefix="/api/progress", tags=["Progress & Analytics"])

@router.get("")
def get_student_progress(current_user: dict = Depends(get_current_user)):
    """Computes comprehensive learning progress and historical metrics."""
    user_id = current_user["id"]
    
    # Active roadmap tasks
    active_roadmap = db.query_one("SELECT * FROM roadmaps WHERE user_id = ? AND is_active = 1", (user_id,))
    total_tasks = 0
    completed_tasks = 0
    tasks_list = []
    
    if active_roadmap:
        tasks = db.query("""
            SELECT * FROM roadmap_tasks
            WHERE roadmap_id = ?
            ORDER BY phase_number ASC, order_index ASC
        """, (active_roadmap["id"],))
        tasks_list = tasks
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t["is_completed"])
        
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # Recent activities
    activities = db.query("""
        SELECT * FROM progress_records
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    """, (user_id,))

    # Skill scores distribution
    skills = db.query("""
        SELECT s.name, ss.rating, ss.proficiency_level, ss.verified
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
        ORDER BY ss.rating DESC
    """, (user_id,))

    # Career readiness score from latest gap analysis
    latest_gap = db.query_one("""
        SELECT overall_readiness_score, career_id, summary, created_at
        FROM skill_gap_analyses
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id,))
    
    readiness_score = float(latest_gap["overall_readiness_score"]) if latest_gap else 0.0

    # Weekly learning velocity (simulated structured data based on completion)
    weekly_velocity = [
        {"week": "Week 1", "tasksCompleted": 3, "hoursSpent": 12, "targetHours": 15},
        {"week": "Week 2", "tasksCompleted": 4, "hoursSpent": 16, "targetHours": 15},
        {"week": "Week 3", "tasksCompleted": 2, "hoursSpent": 10, "targetHours": 15},
        {"week": "Week 4", "tasksCompleted": completed_tasks if completed_tasks < 5 else 4, "hoursSpent": 14, "targetHours": 15},
    ]

    return {
        "readiness_score": readiness_score,
        "completion_rate": completion_rate,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "active_roadmap": active_roadmap,
        "recent_activities": activities,
        "skills_summary": skills,
        "weekly_velocity": weekly_velocity
    }

@router.post("/task/{task_id}/toggle")
def toggle_roadmap_task(task_id: int, current_user: dict = Depends(get_current_user)):
    """Toggles task completion status."""
    user_id = current_user["id"]
    
    task = db.query_one("""
        SELECT rt.*, r.user_id
        FROM roadmap_tasks rt
        JOIN roadmaps r ON rt.roadmap_id = r.id
        WHERE rt.id = ? AND r.user_id = ?
    """, (task_id, user_id))
    
    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found or unauthorized.")
        
    new_status = 0 if task["is_completed"] else 1
    completed_time = "CURRENT_TIMESTAMP" if new_status == 1 else "NULL"
    
    db.execute(f"""
        UPDATE roadmap_tasks
        SET is_completed = ?, completed_at = {completed_time}
        WHERE id = ?
    """, (new_status, task_id))
    
    # Log progress record
    action_desc = f"Completed task: {task['title']}" if new_status == 1 else f"Unchecked task: {task['title']}"
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description)
        VALUES (?, 'TASK_TOGGLED', ?)
    """, (user_id, action_desc))
    
    return {
        "task_id": task_id,
        "is_completed": bool(new_status),
        "message": action_desc
    }
