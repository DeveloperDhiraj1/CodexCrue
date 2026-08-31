"""Train the content model used by the live recommendation service.

The competition submission script predicts dataset course labels. The live app
instead ranks its current MongoDB course candidates, so this artifact is a
shared TF-IDF vocabulary trained from the available course-review corpus.
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "train.csv"
ARTIFACT_PATH = ROOT / "models" / "tfidf_vectorizer.pkl"


def main():
    frame = pd.read_csv(DATA_PATH)
    reviews = frame.get("Reviews", pd.Series(dtype=str)).fillna("").astype(str)
    courses = frame.get("Course", pd.Series(dtype=str)).fillna("").astype(str)
    corpus = (reviews + " " + courses).str.strip()

    vectorizer = TfidfVectorizer(
        max_features=10000,
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=2,
    )
    vectorizer.fit(corpus)
    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(vectorizer, ARTIFACT_PATH)
    print(f"Saved {ARTIFACT_PATH} with {len(vectorizer.vocabulary_)} features from {len(corpus)} rows.")


if __name__ == "__main__":
    main()
