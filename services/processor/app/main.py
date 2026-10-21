from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_projects import router as projects_router
from app.api.routes_jobs import router as jobs_router
from app.api.routes_exports import router as exports_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Local media, speech recognition, and translation processing service for Malayalam Subtitle AI",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# CORS configuration - allow all localhost/127.0.0.1 ports in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(exports_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "health": "/api/v1/health",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.app_env == "development",
    )
