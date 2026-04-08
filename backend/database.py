from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings  # ← single source of truth now


DATABASE_URL = settings.database_url


# Create the engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True,
)


# Enable foreign keys for SQLite (disabled by default)
if "sqlite" in DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Session factory — used to create DB sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class — all models will inherit from this
Base = declarative_base()


# Dependency — used in FastAPI endpoints to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Health check — used in the /health endpoint
def check_database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False