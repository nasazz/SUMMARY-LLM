from fastapi import APIRouter, Depends, HTTPException, status, Query
from src.presentation.dtos.plans.plan_schemas import ProductionPlanCreate, ProductionPlanResponse
from src.presentation.dtos.common_schemas import PaginatedResponse
from src.logic.services.plan_service import PlanService, get_plan_service
from src.api.dependencies import RoleChecker, TokenPayload


# This is the equivalent of [Route("api/v1/plans")]
# We define the prefix and the Swagger group (tags) here.
router = APIRouter(prefix="/plans", tags=["Production Plans"])

@router.post(
    "", 
    response_model=ProductionPlanResponse, 
    status_code=status.HTTP_201_CREATED,
    # dependencies=[Depends(RoleChecker(["Admin", "Manager"]))]  # Only Admins and Managers can create plans
)
def create_plan(
    plan_in: ProductionPlanCreate,
    service: PlanService = Depends(get_plan_service),
    current_user: TokenPayload = Depends(RoleChecker(["Admin", "Manager"]))
) -> ProductionPlanResponse:
    """
    POST endpoint to create a new Production Plan.
    Notice how dumb this function is. It delegates everything to the service.
    """
    result = service.create_plan(plan_in)
    
    if not result.is_success:
        # Translate a business failure into a 400 Bad Request
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result.error
        )
        
    # We must assert that value is not None for strict type checking
    assert result.value is not None 
    return result.value



@router.get(
    "", 
    response_model=PaginatedResponse[ProductionPlanResponse],
    status_code=status.HTTP_200_OK
)
def get_plans(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    service: PlanService = Depends(get_plan_service),
    # We allow Operators to view the list, not just Admins
    current_user: TokenPayload = Depends(RoleChecker(["Admin", "Manager", "Operator"]))
) -> PaginatedResponse[ProductionPlanResponse]:
    """
    GET endpoint to retrieve a paginated list of Production Plans.
    """
    result = service.get_all_plans(page=page, size=size)
    
    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result.error
        )
        
    assert result.value is not None
    return result.value