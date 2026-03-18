from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import boards, lists, tasks, labels

# ── oAuth: uncomment this once you create app/routers/auth.py ──────────────
# from app.routers import auth

app = FastAPI(
    title="FocusDesk API",
    description="Kanban board backend for CSE 499 — FocusDesk project",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Frontend: FRONTEND_URL in .env must match your Vite dev server (default: 5173)
# For production on the Debian server, set FRONTEND_URL=http://186.103.136.74
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,     # Required for Authorization header to be sent
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
# oAuth: add this line once your auth router is ready:
#   app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(lists.router)
app.include_router(tasks.router)
app.include_router(labels.router)


@app.get("/api/health")
def health_check():
    """
    Quick check to confirm the API is running.
    Frontend: call GET /api/health on app startup to verify backend connectivity.
        if response.ok → show "Connected" indicator in dev tools/console
    """
    return {"status": "ok", "project": "FocusDesk"}
