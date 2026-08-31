from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendationRequest(BaseModel):
    userId: Optional[str] = None
    goal: str = Field(min_length=1, max_length=500)
    skills: List[str] = Field(default_factory=list, max_length=100)
    completedCourses: List[str] = Field(default_factory=list, max_length=1000)
    review: str = Field(default="", max_length=2000)
    availableCourses: List[dict] = Field(min_length=1, max_length=1000)

class CourseRecommendation(BaseModel):
    courseId: str
    score: float
    explanation: str

class RecommendationResponse(BaseModel):
    success: bool
    message: str
    recommendations: List[CourseRecommendation]
    modelVersion: str
