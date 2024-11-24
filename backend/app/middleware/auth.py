from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, Security, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Dict, Optional

class AuthHandler:
    security = HTTPBearer()
    secret = "tu_clave_secreta"  # En producción, usar variable de entorno
    
    def create_token(self, username: str) -> str:
        payload = {
            "username": username,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")
    
    def decode_token(self, token: str) -> Dict:
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return {"username": payload["username"]}
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Token inválido")
    
    async def get_auth_header(self, authorization: Optional[str] = Header(None)) -> str:
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Header de autorización no proporcionado"
            )
        
        parts = authorization.split()
        if len(parts) != 2:
            raise HTTPException(
                status_code=401,
                detail="Formato de autorización inválido"
            )
        
        return authorization