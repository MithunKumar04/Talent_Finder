from fastapi import FastAPI
from src.api.rest.routes import auth_router, health_router
from src.data.clients.postgres_client import init_schema
from src.data.repositories.data_injection import seed_super_admin
from fastapi.openapi.utils import get_openapi
from typing import Any
from src.api.rest.error_handler import (
    app_exception_handler,
    generic_exception_handler
)
from src.core.exceptions.base_exception import AppException



app = FastAPI(title="Async Auth Service")
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)




@app.on_event("startup")
async def startup():
    await init_schema()
    await seed_super_admin()

app.include_router(auth_router.router)
app.include_router(health_router.router)