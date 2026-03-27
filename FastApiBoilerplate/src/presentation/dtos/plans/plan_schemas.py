from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# 1. The Base DTO (Shared properties)
class ProductionPlanBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=3, 
        max_length=100, 
        description="The formal name of the production plan"
    )
    status: str = Field(
        default="Draft", 
        description="Current operational status"
    )

# 2. Create DTO (What the client sends in POST)
class ProductionPlanCreate(ProductionPlanBase):
    pass # Inherits all validation from Base

# 3. Update DTO (What the client sends in PUT/PATCH)
class ProductionPlanUpdate(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=100)
    status: str | None = Field(None)

# 4. Response DTO (What the API returns to the client)
class ProductionPlanResponse(ProductionPlanBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)