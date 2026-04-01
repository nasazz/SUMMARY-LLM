import os
from uuid import UUID
from src.logic.results import Result
from src.presentation.dtos.document_dtos import UploadResponse, DocumentResponse
from src.data.unit_of_work import UnitOfWork
from src.data.entities.models import Document
from src.logic.tasks.document_tasks import process_document_task

class DocumentService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow



    def upload_document(self, file_name: str, file_bytes: bytes) -> Result[UploadResponse]:
        try:
            storage_dir = "storage"
            os.makedirs(storage_dir, exist_ok=True)
            file_path = os.path.join(storage_dir, file_name)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            
            # Capture the ID INSIDE the UoW context — after __exit__ the session
            # closes and accessing ORM attributes raises DetachedInstanceError.
            with self.uow:
                document = Document(
                    FileName=file_name,
                    StoragePath=file_path,
                    FileSizeKb=len(file_bytes) // 1024,
                    JobStatus="Pending"
                )
                self.uow.documents.add(document)
                self.uow.session.flush()          # assigns auto-generated Id
                document_id = document.Id         # read while session is alive
                self.uow.session.expunge(document) # detach so commit doesn't re-load

            # Enqueue to Redis — outside UoW so the DB row is fully committed first
            process_document_task.delay(str(document_id))

            response = UploadResponse(tracking_id=document_id, message="Document accepted for processing.")
            return Result.success(response)
            
        except Exception as e:
            return Result.failure(f"Failed to ingest document: {str(e)}")





    def get_document_status(self, document_id: UUID) -> Result[DocumentResponse]:
        try:
            with self.uow:
                entity = self.uow.documents.get_document_with_analysis(document_id)
                if not entity:
                    return Result.failure("Document not found.")
                
                # Model Validate applies from_attributes and handles aliased parsing
                response = DocumentResponse.model_validate(entity)
                return Result.success(response)
        except Exception as e:
            return Result.failure(f"Failed to fetch document status: {str(e)}")
