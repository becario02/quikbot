import re

# Definir el diccionario de abreviaciones
abbreviations = {
    "ticket": ["reporte", "caso", "incidente"],
    "status": ["estado", "estatus"],
    "fase": ["etapa", "estado"],
    "modulo": ["módulo", "sistema", "área"],
    "diagnostico": ["diagnóstico", "evaluación"],
    "NotasSeguimiento": ["notas", "comentarios", "actualizaciones", "seguimiento"],
    "TipoReporte": ["tipo", "categoría"],
    "HorasDesarrollo": ["tiempo", "horas", "duración"],
    "terminado": ["completado", "finalizado", "resuelto"],
    "liberado": ["publicado", "desplegado", "implementado"],
    # Fases
    "Validación": ["validacion"],
    "Documentación": ["documentacion"],
}

def expand_abbreviations(message: str) -> str:
    """
    Reemplaza las palabras completas en el mensaje por sus abreviaciones.
    """
    # Crear un diccionario invertido donde cada palabra completa apunta a su abreviación
    inverted_abbreviations = {word: abbr for abbr, words in abbreviations.items() for word in words}
    
    # Crear una expresión regular que coincida con las palabras completas
    pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in inverted_abbreviations.keys()) + r')\b', re.IGNORECASE)
    
    def replace(match):
        word = match.group(0).lower()
        # Retorna la abreviación correspondiente
        return inverted_abbreviations.get(word, word)
    
    return pattern.sub(replace, message)