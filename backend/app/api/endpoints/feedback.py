# app/api/endpoints/feedback.py

from fastapi import APIRouter, HTTPException, Query
from prisma import Prisma
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

class FeedbackCreate(BaseModel):
    userQuery: str
    botResponse: str
    reason: str
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    userQuery: str
    botResponse: str
    reason: str
    comment: Optional[str]
    createdAt: datetime  

class PaginatedFeedbackResponse(BaseModel):
    feedback: List[FeedbackResponse]
    total: int
    total_pages: int
    current_page: int

@router.post("/feedback")
async def create_feedback(feedback: FeedbackCreate):
    try:
        db = Prisma()
        await db.connect()
        
        created_feedback = await db.feedback.create(
            data={
                'userQuery': feedback.userQuery,
                'botResponse': feedback.botResponse,
                'reason': feedback.reason,
                'comment': feedback.comment
            }
        )
        
        await db.disconnect()
        return {
            "status": "success",
            "data": created_feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback", response_model=PaginatedFeedbackResponse)
async def get_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        db = Prisma()
        await db.connect()

        # Obtener el total de registros
        total_feedback = await db.feedback.count()
        
        # Calcular total de páginas
        total_pages = (total_feedback + limit - 1) // limit

        # Ajustar página si es necesario
        if page > total_pages and total_pages > 0:
            page = total_pages

        # Calcular el offset
        skip = (page - 1) * limit

        # Obtener los registros paginados
        feedback_list = await db.feedback.find_many(
            skip=skip,
            take=limit,
            order={
                'createdAt': 'desc'  # Ordenar por más recientes primero
            }
        )

        await db.disconnect()
        
        return {
            "feedback": feedback_list,
            "total": total_feedback,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener feedback: {str(e)}")