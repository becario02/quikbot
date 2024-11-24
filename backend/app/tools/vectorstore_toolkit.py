from langchain.vectorstores import Qdrant
from langchain_openai import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.agents.agent_toolkits import VectorStoreInfo, VectorStoreToolkit
from langchain.agents import Tool
from qdrant_client import QdrantClient
from app.config import settings

def format_document_with_source(doc):
    """
    Formatea la respuesta incluyendo la fuente del documento y su URL del blob
    """
    source = doc.metadata.get('source', 'Fuente desconocida')
    blob_url = doc.metadata.get('blob_url', None)
    
    if blob_url:
        return f"{doc.page_content}\n\nFuente: [{source}]({blob_url})"
    else:
        return f"{doc.page_content}\n\nFuente: {source}"

def create_vectorstore_search_tool(vectorstore):
    """
    Crea una herramienta de búsqueda personalizada que incluye las URLs reales del blob
    """
    def search_func(query: str) -> str:
        docs = vectorstore.similarity_search(query, k=3)
        results = [format_document_with_source(doc) for doc in docs]
        return "\n\n---\n\n".join(results)

    return Tool(
        name="vectorstore_search",
        description="""
        Herramienta para consultar documentación (Guias de referencia) de la empresa advanpro
        - Contiene documentos sobre manuales técnicos o instructivos destinados a orientar a los usuarios
          en la configuración, uso o solución de problemas relacionados con funcionalidades especificas 
          del software de advanpro.
        - Estos documentos se dividien en las siguientes secciones: 
        """,
        func=search_func
    )

def get_vectorstore_toolkit():
    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )

    embeddings = OpenAIEmbeddings()

    vectorstore = Qdrant(
        client=client,
        collection_name=settings.QDRANT_COLLECTION_NAME,
        embeddings=embeddings
    )

    # Crear herramienta de búsqueda personalizada
    search_tool = create_vectorstore_search_tool(vectorstore)

    return [search_tool]