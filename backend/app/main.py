from typing import cast
import uvicorn
import logging
import sys

# import sentry_sdk
from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware

# from llama_index.node_parser.text.utils import split_by_sentence_tokenizer

from app.api.api import api_router
from app.core.config import settings, AppEnvironment
from app.supabase.client import supabase

# from app.loader_io import loader_io_router

logger = logging.getLogger(__name__)


def __setup_logging(log_level: str):
    log_level = getattr(logging, log_level.upper())
    log_formatter = logging.Formatter(
        "%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s"
    )
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(log_formatter)
    root_logger.addHandler(stream_handler)
    logger.info("Set up logging with log level %s", log_level)


# def __setup_sentry():
#     if settings.SENTRY_DSN:
#         logger.info("Setting up Sentry")
#         if settings.ENVIRONMENT == AppEnvironment.PRODUCTION:
#             profiles_sample_rate = None
#         else:
#             profiles_sample_rate = settings.SENTRY_SAMPLE_RATE
#         sentry_sdk.init(
#             dsn=settings.SENTRY_DSN,
#             environment=settings.ENVIRONMENT.value,
#             release=settings.RENDER_GIT_COMMIT,
#             debug=settings.VERBOSE,
#             traces_sample_rate=settings.SENTRY_SAMPLE_RATE,
#             profiles_sample_rate=profiles_sample_rate,
#         )
#     else:
#         logger.info("Skipping Sentry setup")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)


@app.middleware("http")
async def authenticate(request: Request, call_next):
    access_token = request.headers.get("Authorization")
    user = supabase.auth.get_user(access_token)
    print(user)
    if not user:
        return {"error": "Unauthorized"}, 401
    return await call_next(request)


if settings.BACKEND_CORS_ORIGINS:
    # origins = settings.BACKEND_CORS_ORIGINS.copy()
    # print(origins)
    origins = [
        "http://localhost:3000",
    ]

    # allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex="https://llama-app-frontend.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_PREFIX)
# app.mount(f"/{settings.LOADER_IO_VERIFICATION_STR}", loader_io_router)


def start():
    print("Running in AppEnvironment: " + settings.ENVIRONMENT.value)
    __setup_logging(settings.LOG_LEVEL)
    # __setup_sentry()
    """Launched with `poetry run start` at root level"""

    logger.debug("Skipping migrations")
    live_reload = not settings.RENDER
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=live_reload,
        workers=settings.UVICORN_WORKER_COUNT,
    )


# if __name__ == "__main__":
#     start()
