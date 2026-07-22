from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import fria, cybersecurity, xai, bias, risk
from database import test_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting EU AI Act Compliance Tool API...")
    test_connection()
    yield

app = FastAPI(
    title="EU AI Act Compliance Tool",
    description="Automated FRIA, Cybersecurity, XAI, Risk Scoring and Bias Detection for High-Risk Credit Scoring AI",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(fria.router, prefix="/api/fria", tags=["FRIA"])
app.include_router(cybersecurity.router, prefix="/api/cybersecurity", tags=["Cybersecurity"])
app.include_router(xai.router, prefix="/api/xai", tags=["XAI"])
app.include_router(bias.router, prefix="/api/bias", tags=["Bias Detection"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Scoring"])

@app.get("/")
async def root():
    return {
        "message": "EU AI Act Compliance Tool API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "articles": ["Art.27 FRIA","Art.15 Cybersecurity","Art.13 XAI","Art.9 Risk","Art.10(5) Bias"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}