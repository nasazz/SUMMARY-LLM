from types import TracebackType
from typing import Type, Optional
from src.data.database import SessionLocal
from src.data.repositories.document_repo import DocumentRepository

class UnitOfWork:
    """
    Context manager for the Unit of Work pattern.
    Manages database transactions and provides access to specific repositories.
    """
    def __init__(self):
        self.session = SessionLocal()
        self.documents: DocumentRepository = None # type: ignore

    def __enter__(self):
        # Initialize repositories with the current session
        self.documents = DocumentRepository(self.session)
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ):
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
            
        self.session.close()