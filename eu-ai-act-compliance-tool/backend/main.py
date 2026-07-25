from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import fria, cybersecurity, xai, bias, risk, demo_model
import threading

print("=== EU AI Act Compliance Tool starting ===", flush=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan startup: connecting to Neo4j in background...", flush=True)

    def background_connect():
        try:
            from database import test_connection
            test_connection()
            print("Neo4j connected successfully.", flush=True)
        except Exception as e:
            print(f"Neo4j connection warning: {e}", flush=True)
            print("Server running. Neo4j will retry on first API request.", flush=True)

    t = threading.Thread(target=background_connect, daemon=True)
    t.start()
    t.join(timeout=15)
    print("Startup complete. API is ready.", flush=True)
    yield
    print("Shutting down.", flush=True)


app = FastAPI(
    title="EU AI Act Compliance Tool",
    description="Automated compliance for high-risk credit scoring AI under EU Regulation 2024/1689",
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

app.include_router(fria.router,          prefix="/api/fria",          tags=["FRIA"])
app.include_router(cybersecurity.router, prefix="/api/cybersecurity",  tags=["Cybersecurity"])
app.include_router(xai.router,           prefix="/api/xai",           tags=["XAI"])
app.include_router(bias.router,          prefix="/api/bias",          tags=["Bias Detection"])
app.include_router(risk.router,          prefix="/api/risk",          tags=["Risk Scoring"])
app.include_router(demo_model.router,    prefix="/api/demo-model",    tags=["Demo Model"])


@app.get("/")
async def root():
    return {
        "message": "EU AI Act Compliance Tool API is running",
        "version": "1.0.0",
        "articles": ["Art.27 FRIA", "Art.15 Cybersecurity", "Art.13 XAI", "Art.9 Risk", "Art.10(5) Bias"],
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "eu-ai-act-compliance-tool"}


@app.get("/health/neo4j")
async def health_neo4j():
    try:
        import asyncio
        from database import test_connection
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, test_connection)
        return {"status": "healthy", "neo4j": "connected"}
    except Exception as e:
        return {"status": "degraded", "neo4j": str(e)}