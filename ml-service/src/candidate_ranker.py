from typing import Any

from sklearn.metrics.pairwise import cosine_similarity

from src.preprocessing import clean_text


class CandidateRanker:
    def __init__(self, vectorizer):
        self.vectorizer = vectorizer

    def rank(self, query: str, candidates: list[dict[str, Any]], top_k: int = 30) -> list[dict[str, Any]]:
        if not candidates:
            return []
        query_vector = self.vectorizer.transform([clean_text(query)])
        corpus = [
            clean_text(" ".join([
                str(candidate.get("title", "")),
                str(candidate.get("description", "")),
                " ".join(map(str, candidate.get("skills", []))),
                str(candidate.get("category", "")),
                str(candidate.get("difficulty", ""))
                , str(candidate.get("language", ""))
                , str(candidate.get("contentType", ""))
            ]))
            for candidate in candidates
        ]
        scores = cosine_similarity(query_vector, self.vectorizer.transform(corpus)).flatten()
        order = scores.argsort()[::-1][:top_k]
        return [
            {
                "courseId": str(candidates[index]["courseId"]),
                "score": round(float(scores[index]), 6),
                "explanation": "Ranked by similarity between the learner profile and course content."
            }
            for index in order
        ]
