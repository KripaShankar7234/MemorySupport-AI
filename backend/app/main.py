import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.clients.hindsight_client import hindsight_manager
from app.clients.mongo_client import mongo_manager
from app.services.llm_service import llm_service
from app.api.chat import router as chat_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("memorysupport_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MemorySupport AI backend...")
    logger.info(f"Hindsight Status: {settings.hindsight_status}")
    logger.info(f"Groq Status: {settings.groq_status}")
    logger.info(f"MongoDB Status: {settings.mongo_status}")
    yield
    logger.info("Shutting down MemorySupport AI backend...")
    await hindsight_manager.close()
    await mongo_manager.close()
    await llm_service.close()

app = FastAPI(
    title="MemorySupport AI API",
    description="Agentic Customer Support Copilot with Long-Term Memory (Hindsight Cloud + Groq + MongoDB Atlas)",
    version="0.1.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend (Vite default: http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount chat endpoint at both /api/chat and /chat for convenience
app.include_router(chat_router, prefix="/api")
app.include_router(chat_router)

@app.get("/health")
async def health_check():
    # Perform actual live connectivity check to MongoDB Atlas
    mongo_active = await mongo_manager.ping()
    hindsight_ready = bool(settings.HINDSIGHT_API_KEY)
    groq_ready = bool(settings.GROQ_API_KEY)

    all_healthy = mongo_active and hindsight_ready and groq_ready

    return {
        "status": "healthy" if all_healthy else "degraded",
        "service": "MemorySupport AI Backend",
        "environment": settings.ENVIRONMENT,
        "integrations": {
            "hindsight": hindsight_ready,
            "groq": groq_ready,
            "mongodb": mongo_active,
        },
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to MemorySupport AI Backend API",
        "docs_url": "/docs",
        "health_url": "/health",
        "chat_url": "/api/chat",
    }
