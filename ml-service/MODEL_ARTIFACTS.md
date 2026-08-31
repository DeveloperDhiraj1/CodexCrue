# ML model artifact contract

The FastAPI service loads the artifact configured by `MODEL_PATH` (default:
`models/tfidf_vectorizer.pkl`) once at process startup.

The configured artifact must be a serialized scikit-learn-compatible vectorizer
with a `transform(texts)` method. The backend sends real published MongoDB
course candidates to `/recommend`; the service ranks those candidates and
returns their existing course IDs. It does not invent course IDs or train a
model at request time.

The repository contains the generated TF-IDF artifact at:

- `models/tfidf_vectorizer.pkl`

The artifact is generated from the available review/course corpus by
`scripts/train_recommender.py`. It provides the vocabulary used to rank live
MongoDB course candidates; it does not claim the competition submission's
classification accuracy for the production ranking task.

When supplying a model, set:

```text
MODEL_PATH=/app/models/tfidf_vectorizer.pkl
MODEL_VERSION=<artifact-version>
```

Run the trainer after changing the corpus:

```text
python scripts/train_recommender.py
```
