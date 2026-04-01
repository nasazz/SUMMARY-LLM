import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from uuid import UUID
from src.presentation.dependencies import get_document_service
from src.logic.services.document_service import DocumentService
from src.presentation.dtos.document_dtos import UploadResponse, DocumentResponse
from src.core.exceptions import raise_for_result

logger = logging.getLogger(__name__)

# Note: We do not declare prefix=/api/v1/ here because it is prefixed at main.py globally via settings.API_V1_STR
router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service)
):
    """
    Accepts a PDF document strictly parsing bytes to the Logic internal orchestration layer.
    """
    file_bytes = await file.read()
    file_name = file.filename or "unknown_upload.pdf"
    logger.info(f"Received upload: {file_name} ({len(file_bytes)} bytes)")
    result = service.upload_document(file_name, file_bytes)
    if not result.is_success:
        logger.error(f"Upload failed: {result.error}")
    raise_for_result(result)
    return result.value

@router.get("/{document_id}", response_model=DocumentResponse, status_code=status.HTTP_200_OK)
async def get_document_status_endpoint(
    document_id: UUID,
    service: DocumentService = Depends(get_document_service)
):
    """
    Retrieves the extracted analytical LLM summary associated with an uploaded document UUID.
    """
    result = service.get_document_status(document_id)
    raise_for_result(result)
        
    return result.value
