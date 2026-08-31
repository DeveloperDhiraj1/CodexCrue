from src.candidate_ranker import CandidateRanker
from src.model_loader import ArtifactLoader

class MLInferenceEngine:
    def __init__(self):
        self.loader = ArtifactLoader()
        self.ranker = CandidateRanker(self.loader.artifact) if self.loader.loaded else None

    @property
    def loaded(self):
        return self.loader.loaded

    @property
    def error(self):
        return self.loader.error

    @property
    def version(self):
        return self.loader.version

    def predict(self, goal: str, skills: list, review: str, available_courses: list[dict], completed_courses: list[str] | None = None):
        if not self.ranker:
            self.loader.require()
        completed = {str(course_id) for course_id in (completed_courses or [])}
        candidates = [course for course in available_courses if str(course.get("courseId")) not in completed]
        query = f"{goal} {' '.join(skills)} {review}"
        return self.ranker.rank(query, candidates)

inference_engine = MLInferenceEngine()
