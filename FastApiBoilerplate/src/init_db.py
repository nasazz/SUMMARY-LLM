import pyodbc
import time
import os

print("Waiting for database to start...")
time.sleep(10)

SERVER = os.getenv('DB_HOST', 'db')
USER = os.getenv('DB_USER', 'sa')
PASSWORD = os.getenv('DB_PASSWORD', 'YourStrong@Passw0rd!')
DB_NAME = os.getenv('DB_NAME', 'FastApiDb')

connection_string = f"Driver={{ODBC Driver 18 for SQL Server}};Server={SERVER},1433;UID={USER};PWD={PASSWORD};Encrypt=no"

try:
    print("Connecting to SQL Server to ensure database exists...")
    conn = pyodbc.connect(connection_string, autocommit=True)
    cursor = conn.cursor()
    cursor.execute(f"IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'{DB_NAME}') CREATE DATABASE [{DB_NAME}]")
    print(f"Database {DB_NAME} verified/created successfully.")
    conn.close()
except Exception as e:
    print(f"Error initializing database: {e}")
    raise

# --- Seed admin user after migrations run ---
def seed_admin():
    """Called after alembic upgrade to ensure an admin user exists."""
    try:
        from src.data.database import SessionLocal
        from src.data.entities.models import User
        from passlib.context import CryptContext
        import uuid

        pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        db = SessionLocal()

        existing = db.query(User).filter(User.Email == "admin@corporate.com").first()
        if not existing:
            admin = User(
                Id=uuid.uuid4(),
                Email="admin@corporate.com",
                HashedPassword=pwd_ctx.hash("Admin@1234"),
                Role="Admin",
                IsActive=True,
            )
            db.add(admin)
            db.commit()
            print("Admin user seeded: admin@corporate.com / Admin@1234")
        else:
            print("Admin user already exists, skipping seed.")
        db.close()
    except Exception as e:
        print(f"Warning: Could not seed admin user: {e}")
