from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

class FeatureEngineer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')

    def fit_transform(self, corpus: list):
        return self.vectorizer.fit_transform(corpus)

    def transform(self, corpus: list):
        return self.vectorizer.transform(corpus)

    def save_vectorizer(self, path: str):
        joblib.dump(self.vectorizer, path)

    def load_vectorizer(self, path: str):
        self.vectorizer = joblib.load(path)