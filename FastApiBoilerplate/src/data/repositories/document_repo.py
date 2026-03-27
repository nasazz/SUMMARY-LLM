from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from src.data.repositories.base import BaseRepository
from src.data.entities.models import Document

class DocumentRepository(BaseRepository[Document]):
    def __init__(self, session: Session):
        super().__init__(session, Document)
        
    def get_document_with_analysis(self, document_id: UUID) -> Optional[Document]:
        """Eagerly loads the Document with its related DocumentAnalysis."""
        stmt = (
            select(Document)
            .options(joinedload(Document.Analysis))
            .filter(Document.Id == document_id)
        )
        return self.session.scalars(stmt).first()
