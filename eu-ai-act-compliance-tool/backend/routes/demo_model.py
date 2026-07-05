"""
Demo Model Endpoint
Serves a pre-trained Gradient Boosting classifier on the German Credit dataset.
This endpoint demonstrates the BYOM (Bring Your Own Model) connector feature
by acting as a callable production model that the compliance tool can assess.
Any external credit scoring model following this payload schema can be assessed.
"""

from fastapi import APIRouter
import pandas as pd
import numpy as np
import os

router = APIRouter()

# Train and cache the model at startup
_model = None
_scaler = None
_feature_names = None

def get_trained_model():
    global _model, _scaler, _feature_names
    if _model is not None:
        return _model, _scaler, _feature_names

    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.preprocessing import StandardScaler, LabelEncoder

    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'german_credit.csv')
    column_names = [
        'checking_account', 'duration', 'credit_history', 'purpose', 'credit_amount',
        'savings_account', 'employment', 'installment_rate', 'personal_status', 'other_debtors',
        'residence_since', 'property', 'age', 'other_installment', 'housing',
        'existing_credits', 'job', 'liable_people', 'telephone', 'foreign_worker', 'target'
    ]
    categorical_cols = [
        'checking_account', 'credit_history', 'purpose', 'savings_account', 'employment',
        'personal_status', 'other_debtors', 'property', 'other_installment', 'housing',
        'job', 'telephone', 'foreign_worker'
    ]
    try:
        df = pd.read_csv(data_path, sep=' ', header=None, names=column_names)
    except Exception:
        np.random.seed(42)
        n = 1000
        df = pd.DataFrame({
            'checking_account': np.random.choice(['A11','A12','A13','A14'], n),
            'duration': np.random.randint(4, 72, n),
            'credit_history': np.random.choice(['A30','A31','A32','A33','A34'], n),
            'purpose': np.random.choice(['A40','A41','A42','A43','A44'], n),
            'credit_amount': np.random.randint(250, 18424, n),
            'savings_account': np.random.choice(['A61','A62','A63','A64','A65'], n),
            'employment': np.random.choice(['A71','A72','A73','A74','A75'], n),
            'installment_rate': np.random.randint(1, 5, n),
            'personal_status': np.random.choice(['A91','A92','A93','A94'], n),
            'other_debtors': np.random.choice(['A101','A102','A103'], n),
            'residence_since': np.random.randint(1, 5, n),
            'property': np.random.choice(['A121','A122','A123','A124'], n),
            'age': np.random.randint(19, 75, n),
            'other_installment': np.random.choice(['A141','A142','A143'], n),
            'housing': np.random.choice(['A151','A152','A153'], n),
            'existing_credits': np.random.randint(1, 5, n),
            'job': np.random.choice(['A171','A172','A173','A174'], n),
            'liable_people': np.random.randint(1, 3, n),
            'telephone': np.random.choice(['A191','A192'], n),
            'foreign_worker': np.random.choice(['A201','A202'], n),
            'target': np.random.choice([1, 2], n, p=[0.7, 0.3])
        })

    le = LabelEncoder()
    for col in categorical_cols:
        df[col] = le.fit_transform(df[col].astype(str))

    X = df.drop('target', axis=1).reset_index(drop=True)
    y = (df['target'] == 2).astype(int).reset_index(drop=True)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    _model = model
    _scaler = scaler
    _feature_names = list(X.columns)
    return _model, _scaler, _feature_names


@router.get("/info")
async def model_info():
    """Returns metadata about the demo model."""
    return {
        "model_name": "EU AI Act Compliance Tool - Demo Credit Scoring Model",
        "model_type": "Gradient Boosting Classifier",
        "framework": "scikit-learn",
        "dataset": "German Credit (Statlog) - 1000 records",
        "purpose": "Demo endpoint for the BYOM (Bring Your Own Model) connector feature",
        "description": (
            "This endpoint demonstrates that any external credit scoring model "
            "following the standardised payload schema can be assessed by the "
            "EU AI Act Compliance Tool. Replace this URL with your production "
            "model endpoint to receive compliance reports based on your actual "
            "model behaviour rather than reference dataset proxies."
        ),
        "payload_schema": {
            "applicants": [
                {
                    "checking_account": "integer (0-3)",
                    "duration": "integer (months)",
                    "credit_history": "integer (0-4)",
                    "purpose": "integer (0-4)",
                    "credit_amount": "integer",
                    "savings_account": "integer (0-4)",
                    "employment": "integer (0-4)",
                    "installment_rate": "integer (1-4)",
                    "personal_status": "integer (0-3)",
                    "other_debtors": "integer (0-2)",
                    "residence_since": "integer (1-4)",
                    "property": "integer (0-3)",
                    "age": "integer",
                    "other_installment": "integer (0-2)",
                    "housing": "integer (0-2)",
                    "existing_credits": "integer (1-4)",
                    "job": "integer (0-3)",
                    "liable_people": "integer (1-2)",
                    "telephone": "integer (0-1)",
                    "foreign_worker": "integer (0-1)"
                }
            ]
        },
        "response_schema": {
            "predictions": "list of 0 (good credit) or 1 (bad credit)",
            "probabilities": "list of probability scores for bad credit class"
        }
    }


@router.post("/predict")
async def predict(payload: dict):
    """
    Accepts a list of applicant feature vectors and returns credit risk predictions.
    This is the standardised endpoint schema that the BYOM connector expects.
    """
    try:
        model, scaler, feature_names = get_trained_model()

        applicants = payload.get("applicants", [])
        if not applicants:
            return {"error": "No applicants provided", "predictions": [], "probabilities": []}

        df = pd.DataFrame(applicants)

        # Ensure all expected features are present
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_names]
        X_scaled = scaler.transform(df)

        predictions = model.predict(X_scaled).tolist()
        probabilities = model.predict_proba(X_scaled)[:, 1].tolist()

        return {
            "model": "GradientBoostingClassifier",
            "predictions": predictions,
            "probabilities": [round(p, 4) for p in probabilities],
            "n_applicants": len(predictions),
            "schema_version": "1.0"
        }

    except Exception as e:
        return {"error": str(e), "predictions": [], "probabilities": []}