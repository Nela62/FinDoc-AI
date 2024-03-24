from fastapi import Depends, APIRouter, HTTPException, status
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/competitive-advantage")
async def get_competitive_advantage():
    """
    Get the competitive advantage of the company
    """
    return "The company has a competitive advantage in the market."
