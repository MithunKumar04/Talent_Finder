from sentence_transformers import SentenceTransformer
import numpy as np

_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def get_embedding(text):
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Input text must be a non-empty string")

    embedding = _model.encode(text,normalize_embeddings=True)
    return embedding