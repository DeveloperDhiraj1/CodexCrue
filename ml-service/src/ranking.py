import numpy as np


class Ranker:
    def rank_candidates(self, candidates: list, similarity_scores: np.ndarray):
        ranked = []
        for idx, score in enumerate(similarity_scores):
            if idx < len(candidates):
                candidate = candidates[idx].copy()
                candidate['score'] = float(score)
                ranked.append(candidate)
        
        # Sort descending by score
        ranked = sorted(ranked, key=lambda x: x['score'], reverse=True)
        return ranked
