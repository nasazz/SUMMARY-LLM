from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from src.data.repositories.base import BaseRepository
from src.data.entities.models import User

class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(session, User)
        
    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).filter(User.Email == email)
        return self.session.scalars(stmt).first()
