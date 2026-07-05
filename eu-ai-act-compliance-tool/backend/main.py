from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import fria, cybersecurity, xai, bias, risk, demo_model
from database import test_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting EU AI Act Compliance Tool API...")
    test_connection()
    yield

app = FastAPI(
    title="EU AI Act Compliance Tool",
    description="Automated compliance assessments for high-risk credit scoring AI under Regulation 2024/1689",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fria.router,        prefix="/api/fria",        tags=["FRIA"])
app.include_router(cybersecurity.router,prefix="/api/cybersecurity",tags=["Cybersecurity"])
app.include_router(xai.router,         prefix="/api/xai",         tags=["XAI"])
app.include_router(bias.router,        prefix="/api/bias",         tags=["Bias Detection"])
app.include_router(risk.router,        prefix="/api/risk",         tags=["Risk Scoring"])
app.include_router(demo_model.router,  prefix="/api/demo-model",   tags=["Demo Model"])

@app.get("/")
async def root():
    return {
        "message": "EU AI Act Compliance Tool API is running",
        "version": "1.0.0",
        "modules": ["FRIA", "Cybersecurity", "XAI", "Bias Detection", "Risk Scoring", "Demo Model"],
        "byom_endpoint": "/api/demo-model/predict"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}