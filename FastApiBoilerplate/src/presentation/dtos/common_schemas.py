from pydantic import BaseModel
from typing import Generic, TypeVar

# T will represent whatever DTO we are returning a list of
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Standard corporate envelope for all list endpoints."""
    items: list[T]
    total: int
    page: int
    size: int