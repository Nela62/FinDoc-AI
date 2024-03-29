from fastapi import APIRouter

# from app.api.endpoints import conversation, health, documents, generator
from app.api.endpoints import generator

api_router = APIRouter()
# api_router.include_router(
#     conversation.router, prefix="/conversation", tags=["conversation"]
# )
# api_router.include_router(documents.router, prefix="/document", tags=["document"])
# api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(generator.router, prefix="/aigenerator", tags=["generator"])
