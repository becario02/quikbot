from fastapi  import APIRouter, HTTPException, Query
from prisma   import Prisma
from pydantic import BaseModel
from typing   import Optional

router = APIRouter()

class FeedbackCreate(BaseModel):
    userQuery: str
    botResponse: str
    reason: str
    comment: Optional[str] = None

async def get_db():
    db = Prisma()
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()

@router.post("/feedback")
async def create_feedback(feedback: FeedbackCreate):
    async for db in get_db():
        try:
            result = await db.feedback.create(data=dict(feedback))
            return {"status": "success", "data": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback")
async def get_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    async for db in get_db():
        try:
            # Obtener total y calcular páginas
            total = await db.feedback.count()
            total_pages = (total + limit - 1) // limit
            page = min(page, total_pages) if total_pages > 0 else 1

            # Obtener feedback paginado
            feedback_list = await db.feedback.find_many(
                skip=(page - 1) * limit,
                take=limit,
                order={'createdAt': 'desc'}
            )

            return {
                "feedback": feedback_list,
                "total": total,
                "total_pages": total_pages,
                "current_page": page
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: int):
    async for db in get_db():
        try:
            await db.feedback.delete(where={'id': feedback_id})
            return {"status": "success", "message": "Feedback eliminado correctamente"}
        except Exception as e:
            raise HTTPException(status_code=404 if 'Record to delete does not exist' in str(e) 
                              else 500, detail=str(e))