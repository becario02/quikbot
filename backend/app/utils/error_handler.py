from typing import Tuple, Optional
import logging
from fastapi import HTTPException

class ChatError:
    def __init__(self):
        self.error_messages = {
            # Errores de autenticación
            "google_token_invalid": (
                "Lo siento, parece que tu sesión ha expirado 😅\n\n"
                "Por favor, intenta cerrar sesión y volver a ingresar para continuar nuestra conversación."
            ),
            "token_invalid": (
                "¡Ups! Parece que hubo un problema con tu sesión 😅\n\n"
                "Por favor, intenta cerrar sesión y volver a ingresar para continuar nuestra conversación."
            ),
            "unauthorized": (
                "Lo siento, no tienes permiso para acceder a esta funcionalidad 🔒\n\n"
                "Esta función está reservada para el equipo de soporte de Advan Pro."
            ),
            
            # Errores de OpenAI
            "rate_limit_exceeded": (
                "¡Vaya! Estamos experimentando mucho tráfico en este momento 🚦\n\n"
                "Por favor, espera unos minutos antes de enviar tu siguiente mensaje. "
                "Estamos trabajando para aumentar nuestra capacidad."
            ),
            "context_length_exceeded": (
                "¡Disculpa! Tu mensaje es demasiado largo para procesarlo 📝\n\n"
                "¿Podrías dividirlo en mensajes más cortos? Esto me ayudará a responderte mejor."
            ),
            
            # Error por defecto
            "default": (
                "Ha ocurrido un error inesperado 😔\n\n"
                "El equipo técnico ha sido notificado y estamos trabajando para resolverlo. "
                "Por favor, intenta nuevamente en unos minutos."
            )
        }

    def parse_error(self, error: Exception) -> Tuple[str, int]:
        """
        Analiza el error y retorna un mensaje apropiado para el usuario y el código HTTP.
        """
        error_str = str(error)
        logging.error(f"Error en chat_endpoint: {error_str}")

        # Errores de autenticación
        if "Token de Google inválido" in error_str:
            return self.error_messages["google_token_invalid"], 401
        elif "Token inválido" in error_str:
            return self.error_messages["token_invalid"], 401
        elif "Acceso no autorizado" in error_str:
            return self.error_messages["unauthorized"], 403

        # Errores de OpenAI
        if "rate_limit_exceeded" in error_str:
            return self.error_messages["rate_limit_exceeded"], 429
        elif "context_length_exceeded" in error_str or "maximum context length" in error_str:
            return self.error_messages["context_length_exceeded"], 400

        # Error por defecto
        return self.error_messages["default"], 500

chat_error_handler = ChatError()