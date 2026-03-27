from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# engine is our connection pool to SQL Server
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True, # Automatically reconnects if SQL Server drops the connection
    fast_executemany=True # Crucial for pyodbc performance
)

# SessionLocal is our DbContext factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency injection for our controllers to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()