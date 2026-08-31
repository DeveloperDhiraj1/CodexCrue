from fastapi import FastAPI

from api.routes import router
from src.inference import inference_engine

app = FastAPI(
    title="CodexCrue ML Recommendation Service",
    description="Recommendation service backed by a configured model artifact.",
    version="2.0.0"
)

app.include_router(router)


@app.get("/health")
async def health_check():
    return {
        "success": True,
        "status": "ready" if inference_engine.loaded else "unavailable",
        "modelLoaded": inference_engine.loaded,
        "modelVersion": inference_engine.version,
        "error": inference_engine.error
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
