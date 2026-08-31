import re
import pandas as pd

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def preprocess_dataframe(df: pd.DataFrame, text_column: str) -> pd.DataFrame:
    df = df.copy()
    df['cleaned_text'] = df[text_column].apply(clean_text)
    return df