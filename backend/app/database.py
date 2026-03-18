from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings


# pool_pre_ping=True: tests each connection before use (recovers from DB restarts)
# pool_size=10: persistent connections kept open — fine for a student project load
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    All SQLAlchemy models must inherit from this Base.
    It connects models to the engine and tracks the schema metadata.
    """
    pass


def get_db():
    """
    FastAPI dependency — injects a DB session into any route that declares:
        db: Session = Depends(get_db)

    The session is automatically closed after the request, even on errors.
    Never call SessionLocal() directly in a route — always use Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
