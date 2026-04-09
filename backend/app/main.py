import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.routers import boards, lists, tasks, labels, auth
from app.middleware.rate_limit import limiter, rate_limit_error_handler
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger("focusdesk")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Logs key config on startup so deployment issues are immediately visible."""
    logger.warning("=== FocusDesk API starting ===")
    logger.warning(f"  DB host     : {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    logger.warning(f"  CORS origin : {settings.FRONTEND_URL}")
    logger.warning(f"  Token expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} min")
    if settings.SECRET_KEY == "changeme":
        logger.error("WARNING: SECRET_KEY is still 'changeme' — change this before deploying.")
    yield


app = FastAPI(
    title="FocusDesk API",
    description="Kanban board backend for CSE 499 — FocusDesk project",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.FRONTEND_URL.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Global Security Headers Middleware
    """
    response = await call_next(request)

    # Prevents Clickjacking
    response.headers["X-Frame-Options"] = "DENY"

    # Prevents MIME-sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Content Security Policy (Defense against XSS)
    if not request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'wasm-unsafe-eval'; "
            "style-src 'self' 'unsafe-inline';"
        )

    # Enforces HTTPS (HSTS)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

#Register rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_error_handler)

# Global Exception Handlers

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Flattens Pydantic's nested 422 errors into a clean array.

    Default FastAPI shape:  { detail: [{ loc: [...], msg: "...", type: "..." }] }
    Our shape:              { detail: [{ field: "password", message: "..." }] }

    Frontend: iterate res.detail and show error.message next to the matching field.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({"field": field, "message": error["msg"]})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catches unhandled 500 errors and returns a clean message
    instead of a raw Python traceback.
    """
    logger.exception(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(boards.router)
app.include_router(lists.router)
app.include_router(tasks.router)
app.include_router(labels.router)


# Endpoints

@app.get("/")
def read_root():
    return {"message": "FocusDesk API is running"}


@app.get("/api/health")
def health_check():
    """
    Frontend: call on app startup to verify backend connectivity.

        const res = await fetch('/api/health');
        if (res.ok) console.log('Backend connected');
        else showConnectionErrorBanner();
    """
    return {"status": "ok", "project": "FocusDesk"}