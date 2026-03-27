from src.domain.plans.plan_models import ProductionPlan
from src.domain.plans.plan_schemas import ProductionPlanCreate, ProductionPlanResponse
from src.infrastructure.repository import GenericRepository
from src.infrastructure.uow import UnitOfWork
from src.core.result import Result
from fastapi import Depends
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db
from src.domain.common_schemas import (
    PaginatedResponse,
)  # Add this to your imports at the top


class PlanService:
    def __init__(self, repo: GenericRepository[ProductionPlan], uow: UnitOfWork):
        # Strict dependency injection of our Infrastructure layer
        self._repo = repo
        self._uow = uow

    def create_plan(
        self, plan_dto: ProductionPlanCreate
    ) -> Result[ProductionPlanResponse]:
        """
        Business Logic: Creates a new production plan.
        """
        try:
            # 1. Map DTO to SQLAlchemy Entity
            new_plan = ProductionPlan(name=plan_dto.name, status=plan_dto.status)

            # 2. Stage the data via Repository
            self._repo.add(new_plan)

            # 3. Commit the transaction via Unit of Work
            self._uow.commit()

            # 4. Map Entity back to Response DTO
            response_dto = ProductionPlanResponse.model_validate(new_plan)

            # Direct instantiation for strict type safety
            return Result(is_success=True, value=response_dto)

        except Exception as e:
            # If the database crashes, we roll back and return a failure
            self._uow.rollback()
            return Result(is_success=False, error=f"Failed to create plan: {str(e)}")

    def get_plan_by_id(self, plan_id: int) -> Result[ProductionPlanResponse]:
        """
        Business Logic: Retrieves a plan by ID.
        """
        plan_entity = self._repo.get_by_id(plan_id)

        if not plan_entity:
            return Result(
                is_success=False,
                error=f"Production Plan with ID {plan_id} was not found.",
            )

        response_dto = ProductionPlanResponse.model_validate(plan_entity)
        return Result(is_success=True, value=response_dto)

    def get_all_plans(
        self, page: int = 1, size: int = 10
    ) -> Result[PaginatedResponse[ProductionPlanResponse]]:
        """
        Business Logic: Retrieves a paginated list of production plans.
        Optimized with untracked queries for high performance.
        """
        # Calculate offset (e.g., Page 2 with Size 10 means Skip 10)
        skip = (page - 1) * size

        # 1. Get total count for the frontend pagination controls
        total_items = self._repo.count()

        # 1. Fetch lightweight dictionaries instead of heavy ORM entities
        untracked_records = self._repo.get_untracked_paged(skip=skip, limit=size)

        # 2. Map directly to Pydantic DTOs
        # Pydantic is smart enough to validate raw dictionaries just like ORM objects
        dto_list = [
            ProductionPlanResponse.model_validate(record)
            for record in untracked_records
        ]

        # 4. Wrap in our standard pagination envelope
        response_dto = PaginatedResponse(
            items=dto_list, total=total_items, page=page, size=size
        )

        return Result(is_success=True, value=response_dto)


# This is our equivalent of AddScoped<PlanService>()
def get_plan_service(db: Session = Depends(get_db)) -> PlanService:
    # We instantiate the generic repository specifically for the ProductionPlan model
    repo = GenericRepository(session=db, model=ProductionPlan)
    uow = UnitOfWork(session=db)

    return PlanService(repo=repo, uow=uow)
