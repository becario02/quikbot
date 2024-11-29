from fastapi import APIRouter
from app.api.endpoints import chat, files, prompts, auth

router = APIRouter()

# Incluir todas las rutas
router.include_router(chat.router,    tags=["Chat"])
router.include_router(files.router,   tags=["Files"])
router.include_router(prompts.router, tags=["Promts"])
router.include_router(auth.router,    tags=["Auth"])