from fastapi import APIRouter, HTTPException
from api.schemas import RecommendationRequest, RecommendationResponse, CourseRecommendation
from src.inference import inference_engine
from src.model_loader import ModelUnavailableError

router = APIRouter()

@router.post("/predict", response_model=RecommendationResponse)
async def predict_recommendations(payload: RecommendationRequest):
    try:
        preds = inference_engine.predict(
            goal=payload.goal,
            skills=payload.skills,
            review=payload.review,
            available_courses=payload.availableCourses,
            completed_courses=payload.completedCourses
        )
        
        formatted_recs = [CourseRecommendation(**item) for item in preds]
        
        return RecommendationResponse(
            success=True,
            message="Recommendations generated successfully via the configured model",
            recommendations=formatted_recs,
            modelVersion=inference_engine.version
        )
    except Exception as exc:
        if isinstance(exc, ModelUnavailableError):
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        raise HTTPException(status_code=500, detail="Recommendation inference failed.") from exc


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(payload: RecommendationRequest):
    return await predict_recommendations(payload)
