from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/reference", tags=["Reference Data"])

@router.get("/plants", response_model=List[Dict])
async def get_plants():
    return [{"id": 1, "name": "Main Manufacturing Plant"}, {"id": 2, "name": "Logistics Hub"}]

@router.get("/departments", response_model=List[Dict])
async def get_departments():
    return [{"id": 1, "name": "Quality Assurance"}, {"id": 2, "name": "Operations"}]
