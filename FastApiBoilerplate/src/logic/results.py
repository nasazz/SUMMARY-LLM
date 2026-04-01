from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class Result(Generic[T]):
    """Generic Result encapsulating successes and failures."""
    
    def __init__(self, is_success: bool, value: Optional[T] = None, error: Optional[str] = None):
        if is_success and error is not None:
            raise ValueError("A success result cannot have an error message.")
        if not is_success and error is None:
            raise ValueError("A failure result must have an error message.")
            
        self.is_success = is_success
        self.value = value
        self.error = error

    @classmethod
    def success(cls, value: T) -> "Result[T]":
        return cls(is_success=True, value=value)

    @classmethod
    def failure(cls, error: str) -> "Result[T]":
        return cls(is_success=False, error=error)