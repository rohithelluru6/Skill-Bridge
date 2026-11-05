-- Skill Bridge PostgreSQL Schema
-- AI-Driven Skill Gap Analysis and Career Roadmap Recommender

-- 1. Users table (Students, Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    current_academic_year VARCHAR(50) NOT NULL,
    graduation_year INTEGER NOT NULL,
    target_career_id INTEGER,
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    available_hours_per_week INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skills master list
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Technical', 'Professional', 'Tools')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Skills (with proficiency rating 0 to 5)
CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    rating NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- 5. Career Paths
CREATE TABLE IF NOT EXISTS career_paths (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    industry_expectations TEXT NOT NULL,
    average_salary_range VARCHAR(100),
    demand_level VARCHAR(50) DEFAULT 'High',
    icon_name VARCHAR(50) DEFAULT 'Briefcase',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Career Required Skills
CREATE TABLE IF NOT EXISTS career_required_skills (
    id SERIAL PRIMARY KEY,
    career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    required_level NUMERIC(3,1) NOT NULL CHECK (required_level >= 0 AND required_level <= 5),
    importance VARCHAR(50) DEFAULT 'Required' CHECK (importance IN ('Required', 'Preferred', 'Bonus')),
    UNIQUE(career_id, skill_id)
);

-- 7. Skill Gap Analyses records
CREATE TABLE IF NOT EXISTS skill_gap_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
    overall_readiness_score NUMERIC(5,2) NOT NULL,
    summary TEXT,
    strength_analysis JSONB,
    weakness_analysis JSONB,
    gaps_breakdown JSONB,
    recommended_sequence JSONB,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    estimated_duration_weeks INTEGER DEFAULT 16,
    is_active BOOLEAN DEFAULT TRUE,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Roadmap Tasks (Organized into Phases)
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    phase_title VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    week_number INTEGER DEFAULT 1,
    estimated_hours NUMERIC(4,1) DEFAULT 5.0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0
);

-- 10. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) CHECK (resource_type IN ('Official Documentation', 'YouTube Tutorial', 'Free Online Course', 'Practice Platform', 'GitHub Repository', 'Article/Book')),
    url VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_duration VARCHAR(100),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Project Recommendations
CREATE TABLE IF NOT EXISTS project_recommendations (
    id SERIAL PRIMARY KEY,
    career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    description TEXT NOT NULL,
    technologies_required JSONB,
    learning_outcomes JSONB,
    github_starter_url VARCHAR(500),
    estimated_hours INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Assessment Questions
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    explanation TEXT
);

-- 13. Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    calculated_rating NUMERIC(3,1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Progress Records (Activity & Skill History Log)
CREATE TABLE IF NOT EXISTS progress_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Anonymous AI Resource Searches (Enforces one-time free search per unauthenticated visitor)
CREATE TABLE IF NOT EXISTS anonymous_resource_searches (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) UNIQUE NOT NULL,
    search_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_search_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_skills_user ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_career_skills_career ON career_required_skills(career_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap ON roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_resources_skill ON learning_resources(skill_id);
CREATE INDEX IF NOT EXISTS idx_projects_career ON project_recommendations(career_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress_records(user_id);
