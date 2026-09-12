import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Normalize PostgreSQL URL if needed
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and "+psycopg" not in db_url and "+psycopg2" not in db_url:
    # Default to psycopg (psycopg3) if available
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Configure engine kwargs based on dialect
engine_kwargs = {"echo": settings.DB_ECHO}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["connect_args"] = {"connect_timeout": 5}

try:
    engine = create_engine(db_url, **engine_kwargs)
except Exception as e:
    logger.error(f"Failed to create database engine for {db_url}: {e}")
    # Fallback engine for development / isolated unit test runs
    engine = create_engine("sqlite:///./ecovision.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a SQLAlchemy database session.
    Automatically handles transaction rollback on exceptions and closes the session.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Check database health and return connection status.
    Executes a SELECT 1 query to verify live connectivity.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "connected": True,
        }
    except Exception as e:
        logger.warning(f"Database connection check failed: {e}")
        return {
            "status": "disconnected",
            "dialect": engine.dialect.name if hasattr(engine, "dialect") else "unknown",
            "connected": False,
            "error": str(e),
        }
