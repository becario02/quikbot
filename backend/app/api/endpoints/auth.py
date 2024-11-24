from fastapi             import APIRouter, HTTPException
from pydantic            import BaseModel
from app.middleware.auth import AuthHandler

router = APIRouter()
auth_handler = AuthHandler()

class TokenRequest(BaseModel):
    username: str

@router.post("/generate-token")
async def generate_token(request: TokenRequest):
    """
    Endpoint provisional para generar tokens JWT.
    Solo para pruebas - No usar en producción sin autenticación adecuada.
    """
    try:
        token = auth_handler.create_token(request.username)
        return {
            "token": token,
            "type": "Bearer",
            "expires_in": "7 days",
            "username": request.username
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar token: {str(e)}")