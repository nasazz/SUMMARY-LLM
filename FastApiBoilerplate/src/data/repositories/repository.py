from typing import TypeVar, Generic, Type, Any, Sequence
from sqlalchemy.orm import Session
from src.presentation.dtos.base import Base
from sqlalchemy import select

# T must be a SQLAlchemy model
T = TypeVar("T", bound=Base)

class GenericRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]):
        self._session = session
        self._model = model

    def get_by_id(self, id: Any) -> T | None:
        return self._session.get(self._model, id)

    def get_all(self) -> list[T]:
        return self._session.query(self._model).all()

    def add(self, entity: T) -> None:
        self._session.add(entity)
        # Notice: NO COMMIT HERE. We delegate saving to the Unit of Work.

    def delete(self, entity: T) -> None:
        self._session.delete(entity)
    
    def count(self) -> int:
        """Returns the total number of records in the table."""
        return self._session.query(self._model).count()

    def get_paged(self, skip: int = 0, limit: int = 100) -> list[T]:
        """Equivalent to .OrderBy(x => x.id).Skip(skip).Take(limit)."""
        # SQL Server strictly requires an ORDER BY clause when using OFFSET/LIMIT.
        # We default to ordering by the 'id' column.
        from sqlalchemy import text
        return (
            self._session.query(self._model)
            .order_by(text("id"))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_untracked_paged(self, skip: int = 0, limit: int = 100) -> Sequence[Any]:
        """
        Equivalent to EF Core's .AsNoTracking().Skip(skip).Take(limit).
        Bypasses the ORM Identity Map completely for massive read performance.
        Returns raw dictionaries instead of tracked SQLAlchemy Entities.
        """
        # We query the raw __table__ to bypass ORM object instantiation
        stmt = (
            select(self._model.__table__)
            .order_by(self._model.__table__.c.id)
            .offset(skip)
            .limit(limit)
        )
        
        result = self._session.execute(stmt)
        
        # .mappings().all() returns a list of fast, lightweight dictionaries
        return result.mappings().all()
    