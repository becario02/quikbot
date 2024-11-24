from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks, Query
from app.utils.file_processing import process_and_vectorize_file_async, delete_file_vectors_async
from typing import List, Optional
from pydantic import BaseModel
from app.config import settings
import vercel_blob
import httpx
import os

router = APIRouter()

class BlobDeleteRequest(BaseModel):
    blob_url: str

class PaginatedResponse(BaseModel):
    files: List[dict]
    total: int
    total_pages: int
    current_page: int

@router.get("/files")
async def get_files(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None
):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://blob.vercel-storage.com",
                headers={
                    "Authorization": f"Bearer {settings.BLOB_READ_WRITE_TOKEN}",
                    "Content-Type": "application/octet-stream",
                }
            )
            response.raise_for_status()
            all_files = response.json().get("blobs", [])

            # Aplicar filtro de búsqueda si existe
            if search:
                search = search.lower()
                filtered_files = [
                    f for f in all_files 
                    if search in f.get('pathname', '').lower()
                ]
            else:
                filtered_files = all_files

            # Calcular total y páginas
            total_files = len(filtered_files)
            total_pages = (total_files + limit - 1) // limit

            # Ajustar página si es necesario
            if page > total_pages and total_pages > 0:
                page = total_pages

            # Calcular índices de paginación
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit

            # Obtener archivos de la página actual
            paginated_files = filtered_files[start_idx:end_idx]

            return PaginatedResponse(
                files=paginated_files,
                total=total_files,
                total_pages=total_pages,
                current_page=page
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener la lista de archivos: {str(e)}"
        )

@router.post("/files/upload")
async def upload_files(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    uploaded_files = []
    try:
        async with httpx.AsyncClient() as client:
            for file in files:
                content = await file.read()
                # Subir a Vercel Blob
                response = await client.put(
                    f"https://blob.vercel-storage.com/{file.filename}",
                    headers={
                        "Authorization": f"Bearer {settings.BLOB_READ_WRITE_TOKEN}",
                        "Content-Type": "application/octet-stream",
                    },
                    content=content
                )
                response.raise_for_status()
                blob_data = response.json()
                
                # Obtener la URL real del blob
                blob_url = blob_data.get('url')
                uploaded_files.append({
                    "filename": file.filename,
                    "blob_url": blob_url
                })

                # Programar el procesamiento y vectorización en segundo plano
                background_tasks.add_task(
                    process_and_vectorize_file_async, 
                    content, 
                    file.filename,
                    blob_url  # Pasar la URL real del blob
                )

        return {
            "message": "Archivos subidos correctamente. El procesamiento y vectorización se realizarán en segundo plano.",
            "uploaded": uploaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar los archivos: {str(e)}")
    
@router.delete("/files/delete")
async def delete_file(request: BlobDeleteRequest, background_tasks: BackgroundTasks):
    try:
        # Primero eliminamos el archivo del blob storage
        os.environ["BLOB_READ_WRITE_TOKEN"] = settings.BLOB_READ_WRITE_TOKEN
        vercel_blob.delete([request.blob_url])
        
        # Luego eliminamos los vectores asociados en segundo plano
        background_tasks.add_task(delete_file_vectors_async, request.blob_url)
        
        return {
            "message": "Archivo eliminado exitosamente. Los vectores asociados serán eliminados en segundo plano."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))