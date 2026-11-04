import json
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from app.database import db
from app.auth.dependencies import get_current_user
from app.models.schemas import BatchSkillsUpdateRequest, AssessmentSubmissionRequest, AdminSkillCreateRequest

router = APIRouter(prefix="/api/skills", tags=["Skills"])

@router.get("")
def get_all_skills(category: Optional[str] = None):
    """Returns catalog of master skills."""
    if category:
        skills = db.query("SELECT * FROM skills WHERE category = ? ORDER BY name ASC", (category,))
    else:
        skills = db.query("SELECT * FROM skills ORDER BY category ASC, name ASC")
    return {"skills": skills}

@router.post("")
def add_custom_skill(req: AdminSkillCreateRequest, current_user: dict = Depends(get_current_user)):
    """Allows adding custom skill to the catalog."""
    existing = db.query_one("SELECT * FROM skills WHERE LOWER(name) = LOWER(?)", (req.name.strip(),))
    if existing:
        return {"skill": existing, "message": "Skill already existed in catalog."}
        
    sid = db.execute("""
        INSERT INTO skills (name, category, description)
        VALUES (?, ?, ?)
    """, (req.name.strip(), req.category, req.description or f"Custom skill added by {current_user['full_name']}"))
    
    skill = db.query_one("SELECT * FROM skills WHERE id = ?", (sid,))
    return {"skill": skill, "message": "Custom skill successfully added!"}

@router.get("/my-skills")
def get_student_skills(current_user: dict = Depends(get_current_user)):
    """Returns all skills currently logged by the student."""
    user_id = current_user["id"]
    rows = db.query("""
        SELECT ss.id, ss.skill_id, ss.rating, ss.proficiency_level, ss.verified, ss.updated_at,
               s.name, s.category, s.description
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
        ORDER BY s.category ASC, ss.rating DESC
    """, (user_id,))
    return {"skills": rows}

@router.post("/my-skills")
def update_student_skills(req: BatchSkillsUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Batch updates or inserts student skills."""
    user_id = current_user["id"]
    
    for item in req.skills:
        skill_id = item.skill_id
        # If skill_id wasn't provided but name was, find or create
        if not skill_id and item.skill_name:
            existing = db.query_one("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (item.skill_name.strip(),))
            if existing:
                skill_id = existing["id"]
            else:
                skill_id = db.execute(
                    "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
                    (item.skill_name.strip(), item.category or "Technical", "User-added skill")
                )
                
        if not skill_id:
            continue
            
        # Determine proficiency level if not specified
        prof = item.proficiency_level
        if not prof:
            if item.rating >= 4.5: prof = "Expert"
            elif item.rating >= 3.5: prof = "Advanced"
            elif item.rating >= 2.0: prof = "Intermediate"
            else: prof = "Beginner"
            
        existing_ss = db.query_one("SELECT id FROM student_skills WHERE user_id = ? AND skill_id = ?", (user_id, skill_id))
        if existing_ss:
            db.execute("""
                UPDATE student_skills
                SET rating = ?, proficiency_level = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (item.rating, prof, existing_ss["id"]))
        else:
            db.execute("""
                INSERT INTO student_skills (user_id, skill_id, rating, proficiency_level, verified)
                VALUES (?, ?, ?, ?, 0)
            """, (user_id, skill_id, item.rating, prof))

    # Log activity
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description)
        VALUES (?, 'SKILLS_UPDATED', ?)
    """, (user_id, f"Updated ratings for {len(req.skills)} skills in profile"))

    return get_student_skills(current_user)

@router.get("/assessment/questions")
def get_assessment_questions(skill_id: int):
    """Fetches quiz questions to test and objectively verify a skill."""
    skill = db.query_one("SELECT * FROM skills WHERE id = ?", (skill_id,))
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
        
    questions = db.query("""
        SELECT id, skill_id, question, options, difficulty
        FROM assessments
        WHERE skill_id = ?
    """, (skill_id,))
    
    # Parse options JSON for client consumption (hide correct_option_index)
    parsed = []
    for q in questions:
        parsed.append({
            "id": q["id"],
            "skill_id": q["skill_id"],
            "question": q["question"],
            "options": json.loads(q["options"]) if isinstance(q["options"], str) else q["options"],
            "difficulty": q["difficulty"]
        })
        
    return {
        "skill": skill,
        "questions": parsed,
        "total_questions": len(parsed)
    }

@router.post("/assessment/submit")
def submit_skill_assessment(req: AssessmentSubmissionRequest, current_user: dict = Depends(get_current_user)):
    """Evaluates assessment, grades answers, updates skill rating, and awards verified badge."""
    user_id = current_user["id"]
    skill_id = req.skill_id
    
    skill = db.query_one("SELECT * FROM skills WHERE id = ?", (skill_id,))
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
        
    questions = db.query("SELECT id, correct_option_index, explanation FROM assessments WHERE skill_id = ?", (skill_id,))
    if not questions:
        raise HTTPException(status_code=400, detail="No assessment questions currently configured for this skill.")
        
    q_map = {q["id"]: q for q in questions}
    correct_count = 0
    detailed_feedback = []
    
    for ans in req.answers:
        q_info = q_map.get(ans.question_id)
        if q_info:
            is_correct = (ans.selected_option_index == q_info["correct_option_index"])
            if is_correct:
                correct_count += 1
            detailed_feedback.append({
                "question_id": ans.question_id,
                "is_correct": is_correct,
                "explanation": q_info.get("explanation", "")
            })
            
    total_q = len(questions)
    percentage = (correct_count / total_q) * 100 if total_q > 0 else 0
    
    # Calculate objective rating: scale percentage to 1.0 - 5.0
    calculated_rating = round(max(1.0, min(5.0, (percentage / 100.0) * 5.0)), 1)
    
    if calculated_rating >= 4.5: prof = "Expert"
    elif calculated_rating >= 3.5: prof = "Advanced"
    elif calculated_rating >= 2.0: prof = "Intermediate"
    else: prof = "Beginner"
    
    # Save assessment result
    db.execute("""
        INSERT INTO assessment_results (user_id, skill_id, score, total_questions, correct_answers, calculated_rating)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, skill_id, percentage, total_q, correct_count, calculated_rating))
    
    # Update or insert student skill with verified status
    existing_ss = db.query_one("SELECT id FROM student_skills WHERE user_id = ? AND skill_id = ?", (user_id, skill_id))
    if existing_ss:
        db.execute("""
            UPDATE student_skills
            SET rating = ?, proficiency_level = ?, verified = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (calculated_rating, prof, existing_ss["id"]))
    else:
        db.execute("""
            INSERT INTO student_skills (user_id, skill_id, rating, proficiency_level, verified)
            VALUES (?, ?, ?, ?, 1)
        """, (user_id, skill_id, calculated_rating, prof))

    # Log progress record
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description, metrics)
        VALUES (?, 'ASSESSMENT_COMPLETED', ?, ?)
    """, (
        user_id,
        f"Completed verified skill assessment for {skill['name']} ({percentage:.0f}% score)",
        json.dumps({"skill": skill["name"], "score": percentage, "rating": calculated_rating})
    ))

    return {
        "skill_name": skill["name"],
        "correct_answers": correct_count,
        "total_questions": total_q,
        "percentage": percentage,
        "calculated_rating": calculated_rating,
        "proficiency_level": prof,
        "verified": True,
        "feedback": detailed_feedback
    }
