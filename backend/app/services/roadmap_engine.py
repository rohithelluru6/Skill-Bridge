import json
from typing import Dict, Any, List
from app.database import db

def generate_rule_based_roadmap(
    user_id: int,
    career_id: int,
    available_hours: int = 15,
    gap_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Synthesizes a 5-phase personalized learning roadmap matching
    the student's branch, academic year, current skills, and career goals.
    """
    # 1. Fetch student profile
    profile = db.query_one("""
        SELECT sp.*, u.full_name, u.email
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = ?
    """, (user_id,))
    
    branch = profile["branch"] if profile else "Computer Science Engineering"
    academic_year = profile["current_academic_year"] if profile else "3rd Year"
    student_name = profile["full_name"] if profile else "Student"
    
    # 2. Fetch career
    career = db.query_one("SELECT * FROM career_paths WHERE id = ?", (career_id,))
    if not career:
        raise ValueError(f"Career path {career_id} not found.")

    # 3. Pull gaps
    if not gap_data:
        from app.services.gap_analysis import calculate_skill_gap
        gap_data = calculate_skill_gap(user_id, career_id)

    gaps = gap_data.get("gaps_breakdown", [])
    high_priority_skills = [g["skill_name"] for g in gaps if g["priority"] == "High Priority"]
    med_priority_skills = [g["skill_name"] for g in gaps if g["priority"] == "Medium Priority"]
    
    career_title = career["title"]
    
    # Structure 5-Phase Plan
    phases = [
        {
            "phase_number": 1,
            "phase_title": "Phase 1: Fundamentals & Core Foundations",
            "description": f"Solidify essential technical foundations, math, and core concepts for {branch} students targeting {career_title}.",
            "duration_weeks": 4,
            "tasks": [
                {
                    "title": f"Master Core Programming & Syntax ({', '.join(high_priority_skills[:2]) if high_priority_skills else 'Foundations'})",
                    "description": "Deep-dive into variables, control flow, functions, OOP paradigms, and standard libraries.",
                    "week_number": 1,
                    "estimated_hours": min(20.0, available_hours * 1.2),
                },
                {
                    "title": f"Branch-Aligned Mathematical & Algorithmic Foundations",
                    "description": f"Review applied mathematics, discrete logic, and problem solving tailored for {branch} curriculum.",
                    "week_number": 2,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Version Control & Collaborative Development with Git/GitHub",
                    "description": "Initialize a professional GitHub profile, configure SSH keys, practice branching, PRs, and commit hygiene.",
                    "week_number": 3,
                    "estimated_hours": available_hours * 0.8,
                },
                {
                    "title": "Data Structures Basics (Arrays, Lists, Maps, Stacks, Queues)",
                    "description": "Implement standard data structures from scratch and analyze their time/space Big-O complexities.",
                    "week_number": 4,
                    "estimated_hours": available_hours,
                }
            ]
        },
        {
            "phase_number": 2,
            "phase_title": "Phase 2: Intermediate Skills & Architecture",
            "description": "Bridge high-priority skill deficits and understand industry tools, databases, and clean architecture.",
            "duration_weeks": 4,
            "tasks": [
                {
                    "title": f"Targeted Skill Mastery: {high_priority_skills[0] if high_priority_skills else 'Core Technical Stack'}",
                    "description": f"Comprehensive exercises, hands-on tutorials, and official documentation deep dive.",
                    "week_number": 5,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Database Design, Normalization & SQL Queries",
                    "description": "Relational schema design, writing complex JOINs, indexing, and transactional integrity.",
                    "week_number": 6,
                    "estimated_hours": available_hours,
                },
                {
                    "title": f"Secondary Skill Sprint: {high_priority_skills[1] if len(high_priority_skills) > 1 else (med_priority_skills[0] if med_priority_skills else 'Applied Frameworks')}",
                    "description": "Build functional modules and connect components with RESTful APIs.",
                    "week_number": 7,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Unit Testing, Debugging & Clean Code Standards",
                    "description": "Write automated test cases, adopt linting standards, and practice defensive programming.",
                    "week_number": 8,
                    "estimated_hours": available_hours * 0.9,
                }
            ]
        },
        {
            "phase_number": 3,
            "phase_title": "Phase 3: Advanced Specialization & Tools",
            "description": f"Master cutting-edge industry workflows, cloud deployments, and specialized tools required for {career_title}.",
            "duration_weeks": 4,
            "tasks": [
                {
                    "title": f"Advanced {career_title} Tooling & Ecosystem",
                    "description": f"Master modern toolchains: Docker containerization, CI/CD pipelines, and cloud environments.",
                    "week_number": 9,
                    "estimated_hours": available_hours,
                },
                {
                    "title": f"Bridging Remaining Skill Gaps: {', '.join(med_priority_skills[:2]) if med_priority_skills else 'Performance & Security'}",
                    "description": "Address medium-priority skills to achieve top-tier proficiency benchmarks.",
                    "week_number": 10,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "System Design & Scalability Principles",
                    "description": "Study caching, load balancing, microservices vs monoliths, and asynchronous message queues.",
                    "week_number": 11,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Security Best Practices & API Hardening",
                    "description": "Implement authentication (JWT/OAuth2), RBAC, HTTPS, input sanitation, and rate limiting.",
                    "week_number": 12,
                    "estimated_hours": available_hours * 0.8,
                }
            ]
        },
        {
            "phase_number": 4,
            "phase_title": "Phase 4: Practical Experience & Real-World Projects",
            "description": "Construct portfolio-grade capstone applications, open-source contributions, and showcase code on GitHub.",
            "duration_weeks": 4,
            "tasks": [
                {
                    "title": f"Capstone Project Part 1: Architecture & Core Implementation",
                    "description": f"Architect a complete production-grade {career_title} project solving a genuine problem with documented requirements.",
                    "week_number": 13,
                    "estimated_hours": available_hours * 1.3,
                },
                {
                    "title": "Capstone Project Part 2: Cloud Deployment & CI/CD",
                    "description": "Deploy project to cloud infrastructure with automated build checks and live demonstration URL.",
                    "week_number": 14,
                    "estimated_hours": available_hours * 1.1,
                },
                {
                    "title": "Open Source Contribution & Collaborative Coding",
                    "description": "Submit a pull request to a popular GitHub repo or participate in an online college hackathon.",
                    "week_number": 15,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Technical Blog Post & Documentation Showcase",
                    "description": "Write a deep-dive technical article explaining design trade-offs, architecture decisions, and lessons learned.",
                    "week_number": 16,
                    "estimated_hours": available_hours * 0.7,
                }
            ]
        },
        {
            "phase_number": 5,
            "phase_title": "Phase 5: Career Preparation & Industry Readiness",
            "description": f"Polish resume, master technical coding rounds, prepare behavioral questions, and apply for {career_title} roles.",
            "duration_weeks": 4,
            "tasks": [
                {
                    "title": f"ATS-Optimized Resume Tailored for {career_title}",
                    "description": "Structure technical projects using the STAR method, quantify impact, and highlight validated skills.",
                    "week_number": 17,
                    "estimated_hours": available_hours * 0.8,
                },
                {
                    "title": "Data Structures & Algorithms Interview Sprint (LeetCode / HackerRank)",
                    "description": "Solve top 50 blind interview questions: two-pointers, trees, graphs, and dynamic programming.",
                    "week_number": 18,
                    "estimated_hours": available_hours * 1.2,
                },
                {
                    "title": "Mock Technical & Behavioral Interview Practice",
                    "description": "Simulate real-world engineering panel interviews with peer reviews and situational questions.",
                    "week_number": 19,
                    "estimated_hours": available_hours,
                },
                {
                    "title": "Internship & Job Application Blitz",
                    "description": "Apply to 20+ targeted engineering roles, leverage LinkedIn networking, and follow up with recruiters.",
                    "week_number": 20,
                    "estimated_hours": available_hours,
                }
            ]
        }
    ]

    total_tasks = sum(len(p["tasks"]) for p in phases)
    estimated_duration_weeks = 20

    # Save or update roadmap in DB
    existing_roadmap = db.query_one(
        "SELECT id FROM roadmaps WHERE user_id = ? AND career_id = ? AND is_active = 1",
        (user_id, career_id)
    )
    
    if existing_roadmap:
        roadmap_id = existing_roadmap["id"]
        # Delete old tasks to rebuild fresh
        db.execute("DELETE FROM roadmap_tasks WHERE roadmap_id = ?", (roadmap_id,))
        db.execute("""
            UPDATE roadmaps
            SET title = ?, overview = ?, estimated_duration_weeks = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            f"Personalized {career_title} Roadmap ({branch})",
            f"Customized 20-week learning roadmap designed for {student_name} ({academic_year}, {branch})",
            estimated_duration_weeks,
            roadmap_id
        ))
    else:
        # Deactivate any previous roadmaps
        db.execute("UPDATE roadmaps SET is_active = 0 WHERE user_id = ?", (user_id,))
        roadmap_id = db.execute("""
            INSERT INTO roadmaps (user_id, career_id, title, overview, estimated_duration_weeks, is_active, ai_generated)
            VALUES (?, ?, ?, ?, ?, 1, 0)
        """, (
            user_id,
            career_id,
            f"Personalized {career_title} Roadmap ({branch})",
            f"Customized 20-week learning roadmap designed for {student_name} ({academic_year}, {branch})",
            estimated_duration_weeks
        ))

    # Insert roadmap tasks
    task_counter = 1
    for phase in phases:
        for t in phase["tasks"]:
            db.execute("""
                INSERT INTO roadmap_tasks (
                    roadmap_id, phase_number, phase_title, title, description,
                    week_number, estimated_hours, is_completed, order_index
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
            """, (
                roadmap_id,
                phase["phase_number"],
                phase["phase_title"],
                t["title"],
                t["description"],
                t["week_number"],
                t["estimated_hours"],
                task_counter
            ))
            task_counter += 1

    # Record progress record
    db.execute("""
        INSERT INTO progress_records (user_id, action_type, description, metrics)
        VALUES (?, 'ROADMAP_GENERATED', ?, ?)
    """, (
        user_id,
        f"Generated customized career roadmap for {career_title}",
        json.dumps({"career_id": career_id, "tasks_count": total_tasks, "phases": 5})
    ))

    return {
        "roadmap_id": roadmap_id,
        "career_id": career_id,
        "career_title": career_title,
        "title": f"Personalized {career_title} Roadmap ({branch})",
        "overview": f"Customized 20-week learning roadmap designed for {student_name} ({academic_year}, {branch})",
        "estimated_duration_weeks": estimated_duration_weeks,
        "phases": phases,
        "total_tasks": total_tasks,
        "completed_tasks": 0,
        "progress_percentage": 0.0,
        "engine_type": "Rule-Based Expert Engine"
    }
