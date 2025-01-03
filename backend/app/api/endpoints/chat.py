from fastapi  import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.middleware.auth     import AuthHandler
from app.core.agent          import execute_agent
from app.utils.error_handler import chat_error_handler
import httpx
import logging

router = APIRouter()
auth_handler = AuthHandler()

class ChatInput(BaseModel):
    message: str
    session_id: str
    is_support: bool = False

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
    auth_header: str = Depends(auth_handler.get_auth_header)
):
    try:
        token_type, token = auth_header.split()
        
        if token_type.lower() == 'google':
            # Validar token de Google para usuarios de soporte
            google_user = await validate_google_token(token)
            logging.info(f"Usuario de soporte autenticado: {google_user.get('email')}")
            
            if not google_user.get('email', '').endswith('@advanpro.com.mx'):
                raise HTTPException(status_code=403, detail="Acceso no autorizado")
            
            # Usar el agente unificado en modo soporte (sin username)
            response = await execute_agent(
                message=chat_input.message,
                session_id=chat_input.session_id
            )
        else:
            # Usuario regular: usar el agente con username
            user_data = auth_handler.decode_token(token)
            response = await execute_agent(
                message=chat_input.message,
                session_id=chat_input.session_id,
                username=user_data["username"]
            )
            
        return {"response": response}
    
    except Exception as e:
        # Usar el manejador de errores para obtener el mensaje y código apropiados
        error_message, status_code = await chat_error_handler.parse_error(e)
        raise HTTPException(status_code=status_code, detail=error_message)