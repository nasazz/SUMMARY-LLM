from pydantic import BaseModel, ConfigDict, Field, model_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any
import json

class DocumentAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    summary: str = Field(validation_alias="Summary")
    extracted_keywords: List[str] = Field(validation_alias="ExtractedKeywords")
    confidence_score: Optional[float] = Field(None, validation_alias="ConfidenceScore")
    llm_token_usage: int = Field(validation_alias="LlmTokenUsage")

    @model_validator(mode='before')
    @classmethod
    def parse_keywords(cls, data: Any) -> Any:
        # Handles Pydantic's incoming ORM attributes dynamically
        # Pydantic may pass an ORM object or a validation dict.
        if hasattr(data, "ExtractedKeywords"):
            kw = getattr(data, "ExtractedKeywords")
            if isinstance(kw, str):
                try:
                    # In SQLAlchemy 2.0 ORM mode, we can't easily mutate the mapped attribute inline safely
                    # It's better to construct a dict if it parses as ORM to safely override
                    parsed = json.loads(kw)
                    res = {k: getattr(data, k) for k in dir(data) if not k.startswith('_')}
                    res['ExtractedKeywords'] = parsed
                    return res
                except json.JSONDecodeError:
                    pass
        elif isinstance(data, dict) and "ExtractedKeywords" in data:
            kw = data.get("ExtractedKeywords")
            if isinstance(kw, str):
                try:
                    data["ExtractedKeywords"] = json.loads(kw)
                except json.JSONDecodeError:
                    data["ExtractedKeywords"] = []
        return data


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID = Field(validation_alias="Id")
    file_name: str = Field(validation_alias="FileName")
    job_status: str = Field(validation_alias="JobStatus")
    uploaded_at: datetime = Field(validation_alias="UploadedAt")
    completed_at: Optional[datetime] = Field(None, validation_alias="CompletedAt")
    error_message: Optional[str] = Field(None, validation_alias="ErrorMessage")
    analysis: Optional[DocumentAnalysisResponse] = Field(None, validation_alias="Analysis")


class UploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    tracking_id: UUID
    message: str
