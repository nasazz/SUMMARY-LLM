from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.core.config import settings

# Create the SQLAlchemy engine for SQL Server via pyodbc
# Make sure your DATABASE_URL is properly formatted for pyodbc.
# e.g., mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # Automatically reconnects if SQL Server drops the connection
    fast_executemany=True # Crucial for pyodbc performance
)

# Configure the session maker
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

# Define the Base declarative class
Base = declarative_base()