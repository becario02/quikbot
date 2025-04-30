from fastapi  import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.middleware.auth     import AuthHandler
from app.core.agent          import execute_agent
from app.utils.error_handler import chat_error_handler
import httpx
import logging
from typing import Optional

router = APIRouter()
auth_handler = AuthHandler()

class ChatInput(BaseModel):
    message: str
    session_id: str
    username: Optional[str] = None
    profile_name: Optional[str] = None

# URL para validar tokens de Google
GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

async def validate_google_token(token: str):
    """Valida el token de Google y retorna la información del usuario"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                GOOGLE_TOKEN_INFO_URL,
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Token de Google inválido")
            return response.json()
    except Exception as e:
        logging.error(f"Error validando token de Google: {str(e)}")
        raise HTTPException(status_code=401, detail="Token de Google inválido")

@router.post("/chat")
async def chat_endpoint(
    chat_input: ChatInput,
    auth_header: Optional[str] = Depends(auth_handler.get_optional_auth_header)
):
    try:
        # Caso 1: Si se envía token (Google o JWT)
        if auth_header:
            token_type, token = auth_header.split()

            if token_type.lower() == 'google':
                google_user = await validate_google_token(token)
                logging.info(f"Usuario de soporte autenticado: {google_user.get('email')}")
                
                if not google_user.get('email', '').endswith('@advanpro.com.mx'):
                    raise HTTPException(status_code=403, detail="Acceso no autorizado")
                
                response = await execute_agent(
                    message=chat_input.message,
                    session_id=chat_input.session_id
                )
            else:
                user_data = auth_handler.decode_token(token)
                response = await execute_agent(
                    message=chat_input.message,
                    session_id=chat_input.session_id,
                    username=user_data["username"]
                )

        # Caso 2: Si no hay token, usar los datos enviados manualmente
        else:
            if not chat_input.username or not chat_input.profile_name:
                raise HTTPException(status_code=401, detail="Faltan credenciales para acceso sin token")

            if chat_input.profile_name not in ["Cliente", "Administrador ADVAN"]:
                raise HTTPException(status_code=403, detail="Tipo de perfil no autorizado")

            is_admin = chat_input.profile_name == "Administrador ADVAN"
            username = None if is_admin else chat_input.username  # Admin no requiere username para el agente

            response = await execute_agent(
                message=chat_input.message,
                session_id=chat_input.session_id,
                username=username
            )

        return {"response": response}

    except Exception as e:
        error_message, status_code = await chat_error_handler.parse_error(e)
        raise HTTPException(status_code=status_code, detail=error_message)