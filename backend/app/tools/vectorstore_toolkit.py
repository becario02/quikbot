from langchain.vectorstores import Qdrant
from langchain_openai import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.agents.agent_toolkits import VectorStoreInfo, VectorStoreToolkit
from langchain.agents import Tool
from qdrant_client import QdrantClient
from app.config import settings
from typing import Optional

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

def create_vectorstore_search_tool(vectorstore, description: Optional[str] = None):
    """
    Crea una herramienta de búsqueda personalizada que incluye las URLs reales del blob
    """
    def search_func(query: str) -> str:
        docs = vectorstore.similarity_search(query, k=3)
        results = [format_document_with_source(doc) for doc in docs]
        return "\n\n---\n\n".join(results)

    return Tool(
        name="vectorstore_search",
        description=description or "Herramienta para consultar documentación",
        func=search_func
    )

async def get_vectorstore_toolkit(description: Optional[str] = None):
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
    search_tool = create_vectorstore_search_tool(vectorstore, description)

    return [search_tool]