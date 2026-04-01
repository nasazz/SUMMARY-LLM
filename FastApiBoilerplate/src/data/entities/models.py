import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from src.data.database import Base

# Note: Since we are using SQL Server, using Python's native uuid mapped to a CHAR/VARCHAR or native UNIQUEIDENTIFIER is preferred. 
# SQLAlchemy 2.0 `Uuid` type works well generically.
from sqlalchemy.types import Uuid

class Document(Base):
    __tablename__ = 'Documents'

    Id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    FileName: Mapped[str] = mapped_column(String(255), nullable=False)
    StoragePath: Mapped[str] = mapped_column(String(1024), nullable=False)
    FileSizeKb: Mapped[int] = mapped_column(Integer, nullable=False)
    JobStatus: Mapped[str] = mapped_column(String(50), default='Pending', nullable=False)
    UploadedAt: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    CompletedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    ErrorMessage: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Relationship to DocumentAnalysis (One-to-One)
    Analysis: Mapped[Optional["DocumentAnalysis"]] = relationship(
        "DocumentAnalysis", back_populates="Document", uselist=False
    )


class DocumentAnalysis(Base):
    __tablename__ = 'DocumentAnalyses'

    Id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    DocumentId: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("Documents.Id"), nullable=False)
    Summary: Mapped[str] = mapped_column(Text, nullable=False)
    ExtractedKeywords: Mapped[str] = mapped_column(Text, nullable=False) # Storing JSON string
    ConfidenceScore: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    LlmTokenUsage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship back to Document
    Document: Mapped["Document"] = relationship("Document", back_populates="Analysis")

class User(Base):
    __tablename__ = 'Users'
    
    Id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    Email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    HashedPassword: Mapped[str] = mapped_column(String(255), nullable=False)
    Role: Mapped[str] = mapped_column(String(50), default='User', nullable=False)
    IsActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
