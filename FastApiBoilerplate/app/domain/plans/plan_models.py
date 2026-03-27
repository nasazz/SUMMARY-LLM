from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.domain.base import Base

class ProductionPlan(Base):
    """
    SQLAlchemy Entity representing the ProductionPlan table.
    Using SQLAlchemy 2.0 strictly typed Mapped columns.
    """
    __tablename__ = "production_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False)
    
    # Use UTC for all corporate database timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )