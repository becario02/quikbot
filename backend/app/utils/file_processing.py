import os
import tempfile
import asyncio
from langchain.document_loaders import PyPDFLoader, Docx2txtLoader, UnstructuredPowerPointLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings

async def delete_file_vectors_async(blob_url: str):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, delete_file_vectors, blob_url)

def delete_file_vectors(blob_url: str):
    try:
        # Inicializar el cliente de Qdrant
        client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

        # Construir el filtro para encontrar todos los puntos relacionados con el archivo
        filter_condition = models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.blob_url",
                    match=models.MatchValue(value=blob_url)
                )
            ]
        )

        # Primero, obtener los IDs de los puntos que coinciden con el filtro
        search_result = client.scroll(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            scroll_filter=filter_condition,
            limit=100,  # Ajusta según tus necesidades
            with_payload=True,
            with_vectors=False
        )

        # Extraer los IDs de los puntos encontrados
        point_ids = [point.id for point in search_result[0]]

        if point_ids:
            # Eliminar los puntos encontrados
            client.delete(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                points_selector=models.PointIdsList(
                    points=point_ids
                )
            )
            print(f"Eliminados {len(point_ids)} vectores asociados al archivo {blob_url}")
        else:
            print(f"No se encontraron vectores asociados al archivo {blob_url}")

    except Exception as e:
        print(f"Error al eliminar vectores del archivo {blob_url}: {str(e)}")
        raise

async def process_and_vectorize_file_async(file_content, file_name, blob_url):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, process_and_vectorize_file, file_content, file_name, blob_url)

def process_and_vectorize_file(file_content, file_name, blob_url):
    _, file_extension = os.path.splitext(file_name.lower())
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name

    try:
        if file_extension == '.pdf':
            loader = PyPDFLoader(temp_file_path)
        elif file_extension in ['.doc', '.docx']:
            loader = Docx2txtLoader(temp_file_path)
        elif file_extension in ['.ppt', '.pptx']:
            loader = UnstructuredPowerPointLoader(temp_file_path)
        else:
            raise ValueError(f"Formato de archivo no soportado: {file_extension}")

        documents = loader.load()

        # Actualizar los metadatos de cada documento para incluir la URL real del blob
        for doc in documents:
            doc.metadata.update({
                'source': file_name,
                'blob_url': blob_url  # Usar la URL real del blob
            })
            # Si el documento tiene número de página, mantenerlo
            if 'page' in doc.metadata:
                doc.metadata['page'] = doc.metadata['page']

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        embeddings = OpenAIEmbeddings()
        qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

        Qdrant.from_documents(
            chunks,
            embeddings,
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            collection_name=settings.QDRANT_COLLECTION_NAME,
            force_recreate=False
        )

        print(f"Procesado y vectorizado {file_name}: {len(chunks)} chunks cargados en Qdrant.")
        return True
    except Exception as e:
        print(f"Error al procesar {file_name}: {str(e)}")
        return False
    finally:
        os.unlink(temp_file_path)