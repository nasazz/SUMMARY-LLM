from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from src.data.database import Base
from uuid import UUID

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    """Generic repository providing basic CRUD operations."""

    def __init__(self, session: Session, model_cls: Type[T]):
        self.session = session
        self.model_cls = model_cls

    def get_by_id(self, id: UUID | int | str) -> Optional[T]:
        return self.session.get(self.model_cls, id)

    def add(self, entity: T) -> T:
        self.session.add(entity)
        return entity

    def update(self, entity: T) -> T:
        # In SQLAlchemy, instances tracked by session are updated on commit.
        # But we can explicitly merge if it's detached.
        return self.session.merge(entity)

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
