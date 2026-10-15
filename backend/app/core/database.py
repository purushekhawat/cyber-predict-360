from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy Database Engine with safe fallback
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
except Exception:
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
Base = declarative_base()

def get_db():
    """Dependency that yields a database session and ensures cleanup."""
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_db_connection() -> dict:
    """Helper function to check database connectivity and PostGIS status."""
    if not engine:
        return {
            "status": "disconnected",
            "postgis_enabled": False,
            "error": "Engine initialization deferred"
        }
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT PostGIS_Version();")).fetchone()
            postgis_version = result[0] if result else "Unknown"
            return {
                "status": "connected",
                "postgis_enabled": True,
                "postgis_version": postgis_version
            }
    except Exception as e:
        return {
            "status": "disconnected",
            "postgis_enabled": False,
            "error": str(e)
        }
