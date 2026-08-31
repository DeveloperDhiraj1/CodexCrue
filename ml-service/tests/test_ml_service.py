import asyncio
import unittest

from sklearn.feature_extraction.text import TfidfVectorizer

from api.schemas import RecommendationRequest
from src.candidate_ranker import CandidateRanker
from src.inference import inference_engine


class MLServiceTests(unittest.TestCase):
    def test_empty_checked_in_artifact_is_reported_unavailable(self):
        self.assertFalse(inference_engine.loaded)
        self.assertIn("artifact", inference_engine.error.lower())

    def test_candidate_ranker_uses_candidate_content_and_preserves_ids(self):
        vectorizer = TfidfVectorizer(stop_words="english").fit([
            "python pandas machine learning",
            "react node web development"
        ])
        ranker = CandidateRanker(vectorizer)
        results = ranker.rank("python machine learning", [
            {"courseId": "course-python", "title": "Python ML", "description": "python pandas machine learning", "skills": []},
            {"courseId": "course-web", "title": "Web", "description": "react node web development", "skills": []}
        ])
        self.assertEqual(results[0]["courseId"], "course-python")
        self.assertGreaterEqual(results[0]["score"], results[1]["score"])

    def test_request_requires_real_course_candidates(self):
        with self.assertRaises(Exception):
            RecommendationRequest(goal="Python", availableCourses=[])


if __name__ == "__main__":
    unittest.main()
