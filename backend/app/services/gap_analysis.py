import json
from typing import Dict, Any, List
from app.database import db

def calculate_skill_gap(user_id: int, career_id: int) -> Dict[str, Any]:
    """
    Computes deterministic, transparent skill gap analysis between
    student's current skills and career requirements.
    """
    # 1. Fetch career details
    career = db.query_one("SELECT * FROM career_paths WHERE id = ?", (career_id,))
    if not career:
        raise ValueError(f"Career path with ID {career_id} not found.")

    # 2. Fetch required skills for this career
    required_skills = db.query("""
        SELECT crs.skill_id, crs.required_level, crs.importance, s.name, s.category, s.description
        FROM career_required_skills crs
        JOIN skills s ON crs.skill_id = s.id
        WHERE crs.career_id = ?
        ORDER BY crs.importance DESC, crs.required_level DESC
    """, (career_id,))

    # 3. Fetch student's current skills
    student_skills_rows = db.query("""
        SELECT ss.skill_id, ss.rating, ss.proficiency_level, ss.verified, s.name
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.user_id = ?
    """, (user_id,))
    
    student_skill_map = {row["skill_id"]: row for row in student_skills_rows}

    # 4. Compute gaps
    gaps_breakdown = []
    total_weighted_points = 0.0
    total_max_weighted_points = 0.0
    
    strengths = []
    weaknesses = []
    
    for req in required_skills:
        skill_id = req["skill_id"]
        skill_name = req["name"]
        category = req["category"]
        required_level = float(req["required_level"])
        importance = req.get("importance", "Required")
        
        # Weight by importance
        weight = 1.5 if importance == "Required" else (1.2 if importance == "Preferred" else 1.0)
        
        student_data = student_skill_map.get(skill_id)
        current_rating = float(student_data["rating"]) if student_data else 0.0
        proficiency = student_data["proficiency_level"] if student_data else "None"
        verified = bool(student_data["verified"]) if student_data else False
        
        gap = max(0.0, round(required_level - current_rating, 1))
        
        # Priority Assignment
        if gap >= 2.0 or (gap >= 1.0 and importance == "Required"):
            priority = "High Priority"
            recommended_action = f"Immediate focus required. Master fundamentals of {skill_name} and complete guided practice."
        elif gap >= 0.8:
            priority = "Medium Priority"
            recommended_action = f"Progressive improvement needed. Strengthen intermediate knowledge and build a mini-project in {skill_name}."
        elif gap > 0.0:
            priority = "Low Priority"
            recommended_action = f"Fine-tuning needed. Review edge-cases and best practices in {skill_name}."
        else:
            priority = "Target Met"
            recommended_action = f"Exceeds/meets required level ({current_rating}/5.0). Maintain proficiency through active application."

        # Strength & Weakness categorization
        if current_rating >= required_level or current_rating >= 4.0:
            strengths.append({
                "skill_name": skill_name,
                "current_rating": current_rating,
                "required_level": required_level,
                "note": f"Strong competency in {skill_name} meets industry threshold."
            })
        elif gap >= 1.5:
            weaknesses.append({
                "skill_name": skill_name,
                "current_rating": current_rating,
                "required_level": required_level,
                "gap": gap,
                "priority": priority,
                "note": f"Deficit of {gap} points in essential skill {skill_name}."
            })

        # Weighted calculation for career readiness
        score_contribution = min(current_rating, required_level) * weight
        max_contribution = required_level * weight
        total_weighted_points += score_contribution
        total_max_weighted_points += max_contribution

        gaps_breakdown.append({
            "skill_id": skill_id,
            "skill_name": skill_name,
            "category": category,
            "current_rating": current_rating,
            "required_level": required_level,
            "gap": gap,
            "priority": priority,
            "importance": importance,
            "proficiency": proficiency,
            "verified": verified,
            "recommended_action": recommended_action
        })

    # Overall readiness score (0 - 100%)
    overall_readiness_score = 0.0
    if total_max_weighted_points > 0:
        overall_readiness_score = round((total_weighted_points / total_max_weighted_points) * 100, 1)

    # Sort gaps by Priority descending (High -> Medium -> Low -> Met)
    priority_order = {"High Priority": 0, "Medium Priority": 1, "Low Priority": 2, "Target Met": 3}
    gaps_breakdown.sort(key=lambda x: (priority_order.get(x["priority"], 4), -x["gap"]))

    # Sort recommended learning sequence
    recommended_sequence = [
        item["skill_name"] for item in gaps_breakdown if item["gap"] > 0
    ]

    # Summary analysis
    disclaimer = "Skill scores are estimates based on student-provided information and assessments, not official industry certifications."
    
    summary = (
        f"You have achieved an estimated {overall_readiness_score}% readiness for the {career['title']} role. "
        f"You meet or exceed expectations in {len(strengths)} skills, while {len(weaknesses)} high-impact skills "
        f"require prioritized study to meet industry entry benchmarks. {disclaimer}"
    )

    result = {
        "career_id": career_id,
        "career_title": career["title"],
        "overall_readiness_score": overall_readiness_score,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "gaps_breakdown": gaps_breakdown,
        "recommended_sequence": recommended_sequence,
        "total_skills_evaluated": len(gaps_breakdown),
        "disclaimer": disclaimer,
    }

    # Persist or update analysis in database
    existing_record = db.query_one(
        "SELECT id FROM skill_gap_analyses WHERE user_id = ? AND career_id = ?",
        (user_id, career_id)
    )
    if existing_record:
        db.execute("""
            UPDATE skill_gap_analyses
            SET overall_readiness_score = ?,
                summary = ?,
                strength_analysis = ?,
                weakness_analysis = ?,
                gaps_breakdown = ?,
                recommended_sequence = ?,
                created_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            overall_readiness_score,
            summary,
            json.dumps(strengths),
            json.dumps(weaknesses),
            json.dumps(gaps_breakdown),
            json.dumps(recommended_sequence),
            existing_record["id"]
        ))
    else:
        db.execute("""
            INSERT INTO skill_gap_analyses (
                user_id, career_id, overall_readiness_score, summary,
                strength_analysis, weakness_analysis, gaps_breakdown, recommended_sequence, ai_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            user_id, career_id, overall_readiness_score, summary,
            json.dumps(strengths), json.dumps(weaknesses),
            json.dumps(gaps_breakdown), json.dumps(recommended_sequence)
        ))

    return result
