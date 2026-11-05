import os
import sqlite3
import json
import logging
from typing import Any, List, Dict, Optional
from app.config import settings

logger = logging.getLogger("skillbridge.database")

# Detect available database backend
USE_POSTGRES = False
pg_pool = None

if "postgresql://" in settings.DATABASE_URL or "postgres://" in settings.DATABASE_URL:
    try:
        import psycopg2
        import psycopg2.pool
        import psycopg2.extras

        try:
            # Test direct connection
            test_conn = psycopg2.connect(settings.DATABASE_URL, connect_timeout=3)
            test_conn.close()
            pg_pool = psycopg2.pool.SimpleConnectionPool(1, 20, settings.DATABASE_URL)
            USE_POSTGRES = True
            logger.info("Connected successfully to PostgreSQL database!")
        except Exception as conn_err:
            logger.warning(f"PostgreSQL connection test failed ({conn_err}). Falling back to embedded SQLite.")
            USE_POSTGRES = False
    except ImportError:
        logger.info("psycopg2 not installed. Using high-performance embedded SQLite database.")
        USE_POSTGRES = False


class DatabaseManager:
    def __init__(self):
        self.is_postgres = USE_POSTGRES
        self.sqlite_file = settings.SQLITE_PATH

    def get_connection(self):
        if self.is_postgres and pg_pool:
            conn = pg_pool.getconn()
            conn.autocommit = True
            return conn, True
        else:
            conn = sqlite3.connect(self.sqlite_file)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            return conn, False

    def release_connection(self, conn, is_pg: bool):
        if is_pg and pg_pool:
            pg_pool.putconn(conn)
        else:
            conn.close()

    def query(self, sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
        conn, is_pg = self.get_connection()
        try:
            if is_pg:
                # Convert ? to %s for postgres
                pg_sql = sql.replace("?", "%s")
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    cur.execute(pg_sql, params)
                    if cur.description is not None:
                        rows = cur.fetchall()
                        return [dict(row) for row in rows]
                    return []
            else:
                cur = conn.cursor()
                cur.execute(sql, params)
                if cur.description is not None:
                    rows = cur.fetchall()
                    return [dict(row) for row in rows]
                return []
        finally:
            self.release_connection(conn, is_pg)

    def query_one(self, sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def execute(self, sql: str, params: tuple = ()) -> int:
        """Executes INSERT/UPDATE/DELETE and returns lastrowid or affected rows."""
        conn, is_pg = self.get_connection()
        try:
            if is_pg:
                pg_sql = sql.replace("?", "%s")
                # Add RETURNING id if it's an INSERT without RETURNING
                has_insert = pg_sql.strip().upper().startswith("INSERT INTO")
                has_returning = "RETURNING" in pg_sql.upper()
                if has_insert and not has_returning:
                    pg_sql += " RETURNING id;"
                
                with conn.cursor() as cur:
                    cur.execute(pg_sql, params)
                    if has_insert and cur.description:
                        row = cur.fetchone()
                        return row[0] if row else cur.rowcount
                    return cur.rowcount
            else:
                cur = conn.cursor()
                cur.execute(sql, params)
                conn.commit()
                return cur.lastrowid or cur.rowcount
        finally:
            self.release_connection(conn, is_pg)

    def execute_many(self, sql: str, param_list: List[tuple]):
        conn, is_pg = self.get_connection()
        try:
            if is_pg:
                pg_sql = sql.replace("?", "%s")
                with conn.cursor() as cur:
                    cur.executemany(pg_sql, param_list)
            else:
                cur = conn.cursor()
                cur.executemany(sql, param_list)
                conn.commit()
        finally:
            self.release_connection(conn, is_pg)


db = DatabaseManager()


def init_db():
    """Initializes tables and constraints."""
    if db.is_postgres:
        schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            conn, is_pg = db.get_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(schema_sql)
                logger.info("PostgreSQL schema successfully initialized.")
            finally:
                db.release_connection(conn, is_pg)
    else:
        # SQLite schema initialization
        conn, _ = db.get_connection()
        try:
            cur = conn.cursor()
            cur.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS student_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                college_name TEXT NOT NULL,
                degree TEXT NOT NULL,
                branch TEXT NOT NULL,
                current_academic_year TEXT NOT NULL,
                graduation_year INTEGER NOT NULL,
                target_career_id INTEGER,
                bio TEXT,
                github_url TEXT,
                linkedin_url TEXT,
                available_hours_per_week INTEGER DEFAULT 15,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS student_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                rating REAL NOT NULL,
                proficiency_level TEXT,
                verified INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, skill_id)
            );

            CREATE TABLE IF NOT EXISTS career_paths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT UNIQUE NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                industry_expectations TEXT NOT NULL,
                average_salary_range TEXT,
                demand_level TEXT DEFAULT 'High',
                icon_name TEXT DEFAULT 'Briefcase',
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS career_required_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                required_level REAL NOT NULL,
                importance TEXT DEFAULT 'Required',
                UNIQUE(career_id, skill_id)
            );

            CREATE TABLE IF NOT EXISTS skill_gap_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
                overall_readiness_score REAL NOT NULL,
                summary TEXT,
                strength_analysis TEXT,
                weakness_analysis TEXT,
                gaps_breakdown TEXT,
                recommended_sequence TEXT,
                ai_generated INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                overview TEXT,
                estimated_duration_weeks INTEGER DEFAULT 16,
                is_active INTEGER DEFAULT 1,
                ai_generated INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS roadmap_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
                phase_number INTEGER NOT NULL,
                phase_title TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                week_number INTEGER DEFAULT 1,
                estimated_hours REAL DEFAULT 5.0,
                is_completed INTEGER DEFAULT 0,
                completed_at TIMESTAMP,
                skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
                order_index INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS learning_resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                resource_type TEXT,
                url TEXT NOT NULL,
                difficulty TEXT,
                estimated_duration TEXT,
                is_verified INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS project_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                career_id INTEGER REFERENCES career_paths(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                difficulty TEXT,
                description TEXT NOT NULL,
                technologies_required TEXT,
                learning_outcomes TEXT,
                github_starter_url TEXT,
                estimated_hours INTEGER DEFAULT 20,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_option_index INTEGER NOT NULL,
                difficulty TEXT DEFAULT 'Intermediate',
                explanation TEXT
            );

            CREATE TABLE IF NOT EXISTS assessment_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                score REAL NOT NULL,
                total_questions INTEGER NOT NULL,
                correct_answers INTEGER NOT NULL,
                calculated_rating REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS progress_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action_type TEXT NOT NULL,
                description TEXT NOT NULL,
                metrics TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS anonymous_resource_searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_id TEXT UNIQUE NOT NULL,
                search_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_search_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()
            logger.info("SQLite database schema initialized successfully.")
        finally:
            conn.close()
