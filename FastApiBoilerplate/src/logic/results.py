from typing import TypeVar, Generic, Any

# T represents the type of data we return on success (e.g., a Pydantic DTO)
T = TypeVar("T")

class Result(Generic[T]):
    """
    Enterprise Result Pattern.
    Prevents the use of expensive exceptions for standard business logic control flow.
    """
    def __init__(self, is_success: bool, value: T | None = None, error: str | None = None):
        self.is_success = is_success
        self.value = value
        self.error = error

    @classmethod
    def ok(cls, value: T) -> "Result[T]":
        return cls(is_success=True, value=value)

    @classmethod
    def fail(cls, error: str) -> "Result[Any]":
        return cls(is_success=False, error=error)