from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from app.config import settings
from urllib.parse import quote_plus

# Codificar la contraseña para manejar caracteres especiales
encoded_password = quote_plus(settings.DB_PASSWORD)

# Construir la URI de conexión usando la contraseña codificada
db_uri = f"mssql+pyodbc://{settings.DB_USER}:{encoded_password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?driver=ODBC+Driver+17+for+SQL+Server"

def get_db():
    try:
        # Crear el engine con timeouts configurados
        engine = create_engine(db_uri)

        # Especifica las vistas que deseas incluir
        included_tables = ['vReporteClienteChat', 'vModulosCliente']

        # Crear la instancia de SQLDatabase con la vista incluida
        db = SQLDatabase(engine, include_tables=included_tables, view_support=True, max_string_length=10000)

        return db
    except Exception as e:
        print(f"Error al conectar a la base de datos: {str(e)}")
        # Mostrar más detalles del error si están disponibles
        if hasattr(e, 'orig'):
            print(f"Error original: {str(e.orig)}")
        raise