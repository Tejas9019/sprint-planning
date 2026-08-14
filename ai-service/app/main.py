import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core import gemini # ensure Gemini configuration triggers
from app.core.logging_config import setup_logging

# Initialize logging configuration
setup_logging()
logger = logging.getLogger("app.main")

app = FastAPI(title="TrackFlows AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to log incoming HTTP requests and latency
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000
    
    logger.info(
        f"HTTP {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Latency: {duration:.2f}ms"
    )
    return response

@app.on_event("startup")
def run_migrations():
    from app.db.session import engine
    from app.db.models import Base
    
    logger.info("Ensuring database tables are created...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")

app.include_router(api_router, prefix="/api/v1")
