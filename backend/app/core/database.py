from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy Database Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that yields a database session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_db_connection() -> dict:
    """Helper function to check database connectivity and PostGIS status."""
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
