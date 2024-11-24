from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from app.database.db_config import get_db
from app.utils.query_filter import apply_customer_filter, decode_unicode
from typing import Optional

def get_sql_toolkit(username: Optional[str] = None):
    db = get_db()
    
    if username is not None:
        # Sobreescribir el método run para aplicar filtro y decodificar Unicode
        original_run = db.run
        def filtered_run(query: str, *args, **kwargs):
            decoded_query = decode_unicode(query)
            filtered_query = apply_customer_filter(decoded_query, username)
            return original_run(filtered_query, *args, **kwargs)
        db.run = filtered_run
        
        description = """
        Utiliza esta herramienta cuando necesites consultar datos estructurados 
        almacenados en la base de datos SQL Server. Las consultas están automáticamente 
        filtradas para mostrar solo información relevante para el usuario actual.
        Usa esta herramienta para consultas sobre tickets o modulos del cliente.
        """
    else:
        # Modo soporte - solo decodificar Unicode
        original_run = db.run
        db.run = lambda query, *args, **kwargs: original_run(
            decode_unicode(query), 
            *args, 
            **kwargs
        )
        
        description = """
        Herramienta para consultas SQL Server sin restricciones.
        - Acceso completo a todas las tablas
        - No hay filtros automáticos
        - Usa esta herramienta para consultas sobre tickets o modulos
        """
    
    sql_toolkit = SQLDatabaseToolkit(
        db=db,
        llm=ChatOpenAI(temperature=0),
        database_name="Base de Datos MySQL",
        description=description
    )
    
    return sql_toolkit.get_tools()