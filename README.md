# Skill Bridge 🌉
### AI-Driven Skill Gap Analysis & Career Roadmap Recommender for Engineering Students

Skill Bridge is a modern, responsive, commercial-grade EdTech web platform engineered to help undergraduate engineering students bridge the gap between academic theory and industry requirements.

---

## 🌟 Key Features

1. **AI-Powered Skill Gap Analysis (Flagship Feature)**:
   - Compares student self-ratings and verified assessments against industry hiring benchmarks across 9 target career paths.
   - Calculates exact numerical deficits for every required skill.
   - Categorizes gaps into **High Priority**, **Medium Priority**, **Low Priority**, and **Target Met**.
   - Generates transparent, deterministic career readiness percentages ($0-100\%$) alongside LLM-powered strategic narratives and recruiter advice.
   - Visualizes skill balance via interactive **Bar Charts** and multidimensional **Competency Radar Charts**.

2. **Personalized 5-Phase Career Roadmap Generator**:
   - Synthesizes personalized week-by-week learning schedules tailored to the student's **engineering branch**, **academic year**, **existing proficiencies**, and **weekly study hours**.
   - **Phase 1: Fundamentals & Core Foundations** (Programming syntax, discrete math, Git/GitHub, basic DSA)
   - **Phase 2: Intermediate Skills & Architecture** (Targeted skill mastery, database normalization, SQL joins, unit testing)
   - **Phase 3: Advanced Specialization & Tools** (Docker containers, cloud environments, system design, security best practices)
   - **Phase 4: Practical Experience & Capstones** (Production-grade applications, GitHub commits, hackathons, technical blogging)
   - **Phase 5: Career Preparation & Industry Readiness** (ATS resumes, blind coding interview sprints, mock interviews, internship applications)
   - Interactive task completion checkboxes with real-time progress persistence and celebratory confetti animations.

3. **Interactive Skill Assessment & Verification**:
   - Branch-specific calibrations for 8 major engineering disciplines:
     - Computer Science Engineering (CSE)
     - Information Technology (IT)
     - Artificial Intelligence & Machine Learning (AIML)
     - Data Science (DS)
     - Electronics & Communication Engineering (ECE)
     - Electrical Engineering (EEE)
     - Mechanical Engineering (ME)
     - Civil Engineering (CE)
   - Categorized skills: Technical, Professional, and Tools on a 0.0 to 5.0 scale.
   - In-app **Diagnostic Quiz Modal** that grades technical multiple-choice questions, computes objective ratings, and awards verified badges.
   - Ability to add custom engineering skills with automatic database persistence.

4. **Career Exploration Module**:
   - 9 complete industry pathways:
     1. Software Developer
     2. AI/ML Engineer
     3. Data Scientist
     4. Full Stack Developer
     5. Cloud Engineer
     6. DevOps Engineer
     7. Cybersecurity Analyst
     8. Data Analyst
     9. UI/UX Designer
   - Comprehensive profiles: required technical/professional skills, tools, suggested projects, industry expectations, and compensation brackets.

5. **Learning Resource Recommender**:
   - Curated verified resources mapped directly to missing skills.
   - Filters by Official Documentation, Free Online Courses (Harvard CS50, FreeCodeCamp), and Practice Platforms.
   - Zero broken/invented URLs.

6. **Tiered Portfolio Project Recommendations**:
   - Beginner, Intermediate, and Advanced project blueprints with documented tech stacks, starter architecture repositories, and learning outcomes.

7. **Progress Velocity & Analytics**:
   - Historical activity audit trail, weekly hours velocity charts, task completion percentages, and overall career readiness tracking.

8. **Admin Management Portal**:
   - Role-based authorization (`admin` role).
   - View registered student records, colleges, branches, and career readiness scores.
   - Platform analytics: student counts, popular career tracks, and branch distribution charts.
   - Manage and create new career tracks and master skills.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js with Vite
  - Tailwind CSS (Modern SaaS theme: Blue, Purple, Slate, and White)
  - React Router DOM
  - Lucide React icons
  - Recharts (BarChart, RadarChart, AreaChart, PieChart)
  - Canvas Confetti
- **Backend**:
  - Python FastAPI
  - RESTful architecture with Pydantic validation
  - PBKDF2-HMAC-SHA256 password hashing & HMAC-SHA256 JWT tokens
  - CORS middleware
- **Database**:
  - PostgreSQL (full DDL script in `backend/schema.sql`)
  - Automatic embedded high-performance fallback (`skillbridge.db`) with identical schema and full relational integrity when PostgreSQL is not running.
- **AI Integration**:
  - Secure backend proxy supporting **Google Gemini API** (`gemini-1.5-flash`) and **OpenAI API** (`gpt-4o-mini`).
  - Transparent **Built-in Expert Rule-Based Engine** fallback when API keys are not supplied.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Instant One-Command Run (Serves Frontend & API together on Port 8000)

```bash
# 1. From root, navigate to backend
cd backend

# 2. Start the unified production server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!
The interactive API documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

### 3. Development Mode (Hot Reloading Frontend + API)

If you are developing frontend components with instant Vite HMR:

**Terminal 1 (Backend API):**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend with Vite):**
```bash
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. All `/api` requests are automatically proxied to port 8000.

---

## 🔑 Pre-Seeded Demo Credentials

For instant testing, use the 1-click demo buttons on the Login page or sign in with:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@skillbridge.edu` | `password123` | Alex Rivera (3rd Year CSE, Stanford University) |
| **Admin** | `admin@skillbridge.edu` | `admin123` | Dr. Sarah Mitchell (Platform Administrator) |

*You can also register a brand new student account with custom university and branch details.*

---

## 🗄️ Database Architecture

The database includes 14 relational tables:
1. `users`: Student and admin accounts with password hashes and roles.
2. `student_profiles`: Academic background (college, degree, branch, year, graduation year, target career).
3. `skills`: Master catalog of technical, professional, and tool skills.
4. `student_skills`: Student ratings (0-5), proficiency levels, and verified quiz status.
5. `career_paths`: Industry career profiles, descriptions, demand levels, and salary ranges.
6. `career_required_skills`: Benchmark required levels and importance weights for careers.
7. `skill_gap_analyses`: Deterministic and AI-generated gap evaluations and readiness scores.
8. `roadmaps`: Personalized student career roadmaps.
9. `roadmap_tasks`: 5-phase week-by-week actionable tasks with completion flags.
10. `learning_resources`: Vetted tutorials, courses, and documentation links.
11. `project_recommendations`: Beginner, Intermediate, and Advanced capstone blueprints.
12. `assessments`: Diagnostic multiple-choice questions for technical skills.
13. `assessment_results`: Student quiz attempts, scores, and calculated ratings.
14. `progress_records`: Audit log of milestone completions, updates, and activities.

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/register` - Create student account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Current authenticated user & profile

### Student Profile & Skills
- `GET /api/students/profile` - Fetch student profile & target career
- `PUT /api/students/profile` - Update academic profile & study hours
- `GET /api/skills` - List master skills catalog
- `POST /api/skills` - Add custom skill
- `GET /api/skills/my-skills` - List logged skills with ratings
- `POST /api/skills/my-skills` - Batch update skill ratings (0-5)
- `GET /api/skills/assessment/questions` - Fetch diagnostic quiz questions
- `POST /api/skills/assessment/submit` - Grade assessment & award verified badge

### Careers & AI Recommendations
- `GET /api/careers` - List all 9 engineering career paths
- `GET /api/careers/{id}` - Comprehensive career specs, required skills & projects
- `POST /api/careers/select-goal` - Select primary target career
- `POST /api/ai/skill-gap-analysis` - Compute numerical gaps, priority levels & AI strategic insights
- `POST /api/ai/generate-roadmap` - Synthesize 5-phase personalized learning roadmap
- `POST /api/ai/recommend-resources` - Recommend vetted resources for skill gaps

### Progress & Admin
- `GET /api/progress` - Task completion rates, hours spent & audit feed
- `POST /api/progress/task/{id}/toggle` - Check off roadmap tasks
- `GET /api/admin/students` - Admin list of registered student cohorts
- `POST /api/admin/careers` - Create new industry career paths
- `POST /api/admin/skills` - Add administrative skills
- `GET /api/admin/analytics` - Platform health and popular career metrics

---

## 🔒 Security & AI Transparency

- **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 rounds and unique random salt per user.
- **Route Protection**: JWT Bearer token authentication on all dashboard and admin endpoints.
- **Role-Based Access**: Strict `require_admin` dependency restricting admin routes.
- **API Key Protection**: AI keys remain strictly server-side in environment variables (`GEMINI_API_KEY` / `OPENAI_API_KEY`).
- **Transparency**: Transparent badges clearly identify whether recommendations originate from a live LLM or the deterministic rule-based engine.
- **Academic Disclaimer**: Clear notices emphasize that readiness scores are estimates based on student-entered data and diagnostic assessments, not official industry certifications.
