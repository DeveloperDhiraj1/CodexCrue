import numpy as np
from src.preprocessing import clean_text
from src.similarity import compute_similarity, get_top_similar_indices
from src.ranking import Ranker

class RecommenderEngine:
    def __init__(self):
        self.ranker = Ranker()

    def recommend(self, query: str, course_database: list, corpus_matrix, vectorizer):
        cleaned_q = clean_text(query)
        q_vec = vectorizer.transform([cleaned_q])
        
        scores = compute_similarity(q_vec, corpus_matrix)
        top_indices = get_top_similar_indices(scores, top_k=5)
        
        candidates = [course_database[i] for i in top_indices if i < len(course_database)]
        top_scores = scores[top_indices]
        
        return self.ranker.rank_candidates(candidates, top_scores)