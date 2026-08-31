from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def compute_similarity(query_vector, corpus_matrix):
    similarities = cosine_similarity(query_vector, corpus_matrix)
    return similarities.flatten()

def get_top_similar_indices(similarities: np.ndarray, top_k: int = 5):
    return np.argsort(similarities)[::-1][:top_k]