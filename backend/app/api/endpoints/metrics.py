from fastapi import Depends, APIRouter, HTTPException, status
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class MetricInfo(BaseModel):
    template: str
    company_ticker: str
    recommendation: str | None = None
    target_price: float | None = None


@router.post("/metrics/")
async def get_metrics():
    """
    Get the competitive advantage of the company
    """
    return "The company has a competitive advantage in the market."
