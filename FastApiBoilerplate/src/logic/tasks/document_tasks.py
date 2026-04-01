import uuid
import logging
import fitz  # PyMuPDF
import json
from datetime import datetime, timezone
from src.core.celery_app import celery_app
from src.data.unit_of_work import UnitOfWork
from src.data.entities.models import DocumentAnalysis
from src.logic.ai.llm_client import LlmClient

logger = logging.getLogger(__name__)

@celery_app.task(name="process_document_task")
def process_document_task(document_id: str):
    """
    Background worker orchestrating LLM text extraction.
    Executes resilient parsing, AI analysis, and UoW state transitions natively.
    """
    try:
        doc_uuid = uuid.UUID(document_id)
        
        # Open main structural UoW Context
        with UnitOfWork() as uow:
            document = uow.documents.get_by_id(doc_uuid)
            if not document:
                logger.error(f"Celery failure: Document {document_id} not found in DB.")
                return

            # Shift state internally and explicitly execute an intermediate commit
            # This broadcasts "Processing" accurately so asynchronous frontend polling registers accurately
            document.JobStatus = "Processing"
            uow.documents.update(document)
            uow.session.commit()
            
            try:
                # 1. Extraction: Delegate native Python logic fetching raw text over PyMuPDF
                extracted_text = ""
                with fitz.open(document.StoragePath) as doc:
                    for page in doc:
                        extracted_text += page.get_text()
                
                if not extracted_text.strip():
                    raise ValueError("Document yielded no searchable extracted text.")

                # 2. AI Analysis: Forward string buffer to explicit orchestration module safely
                llm = LlmClient()
                result = llm.analyze_document_text(extracted_text)
                
                # 3. Success Context Mapping
                data = result["analysis"]
                
                analysis_entity = DocumentAnalysis(
                    DocumentId=doc_uuid,
                    Summary=data.get("summary", ""),
                    ExtractedKeywords=json.dumps(data.get("extracted_keywords", [])),
                    ConfidenceScore=data.get("confidence_score"),
                    LlmTokenUsage=result.get("total_tokens", 0)
                )
                
                uow.session.add(analysis_entity)
                
                document.JobStatus = "Completed"
                document.CompletedAt = datetime.now(timezone.utc)
                uow.documents.update(document)
                
            except Exception as worker_exception:
                # 4. Resilient Failure Handling
                logger.exception(f"Document Execution Pipeline Failed: {worker_exception}")
                document.JobStatus = "Failed"
                document.ErrorMessage = str(worker_exception)
                uow.documents.update(document)
                
            # The context manager natively commits on successful __exit__ 
            # (which persists whichever logical fork applied above automatically).
            
    except Exception as e:
        logger.exception(f"Fatal error booting processing environment structure for {document_id}: {str(e)}")
