from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

EMAIL_PATTERN = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=6)
    college_name: str = Field(..., min_length=2)
    degree: str = Field(..., min_length=2)
    branch: str = Field(..., min_length=2)
    current_academic_year: str = Field(..., min_length=1)
    graduation_year: int = Field(..., ge=2020, le=2035)

class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    college_name: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    current_academic_year: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    available_hours_per_week: Optional[int] = Field(default=15, ge=1, le=80)

class SkillRatingItem(BaseModel):
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    category: Optional[str] = "Technical"
    rating: float = Field(..., ge=0.0, le=5.0)
    proficiency_level: Optional[str] = "Beginner"

class BatchSkillsUpdateRequest(BaseModel):
    skills: List[SkillRatingItem]

class AssessmentSubmitItem(BaseModel):
    question_id: int
    selected_option_index: int

class AssessmentSubmissionRequest(BaseModel):
    skill_id: int
    answers: List[AssessmentSubmitItem]

class CareerSelectRequest(BaseModel):
    career_id: int

class GapAnalysisRequest(BaseModel):
    career_id: Optional[int] = None

class RoadmapGenerateRequest(BaseModel):
    career_id: Optional[int] = None
    available_hours_per_week: Optional[int] = None
    force_regenerate: Optional[bool] = False

class ResourceRecommendRequest(BaseModel):
    skill_ids: Optional[List[int]] = None
    career_id: Optional[int] = None

class TaskToggleRequest(BaseModel):
    task_id: int
    is_completed: bool

class AdminCareerCreateRequest(BaseModel):
    title: str
    slug: str
    category: str
    description: str
    industry_expectations: str
    average_salary_range: Optional[str] = "$70,000 - $130,000 / ₹8 - 25 LPA"
    demand_level: Optional[str] = "High"
    icon_name: Optional[str] = "Briefcase"
    required_skills: List[Dict[str, Any]] = []

class AdminSkillCreateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
