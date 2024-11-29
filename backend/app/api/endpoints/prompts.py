from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.agent import prompt_cache, tool_cache
from prisma import Prisma
import logging

router = APIRouter()

class PromptUpdate(BaseModel):
    content: str

class ToolDescriptionUpdate(BaseModel):
    description: str
    supportDescription: str | None = None

@router.get("/prompts")
async def get_prompts():
    """Obtiene todos los prompts"""
    try:
        db = Prisma()
        await db.connect()
        prompts = await db.agentprompt.find_many()
        await db.disconnect()
        
        return {
            "status": "success",
            "data": prompts
        }
    except Exception as e:
        logging.error(f"Error getting prompts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/prompts/{prompt_type}")
async def update_prompt(prompt_type: str, prompt: PromptUpdate):
    """Actualiza un prompt específico"""
    try:
        db = Prisma()
        await db.connect()
        updated_prompt = await db.agentprompt.update(
            where={
                'type': prompt_type
            },
            data={
                'content': prompt.content
            }
        )
        await db.disconnect()
        
        # Actualizar cache
        prompt_cache.set(prompt_type, prompt.content)
        
        logging.info(f"Prompt '{prompt_type}' updated")
        return {
            "status": "success",
            "message": f"Prompt '{prompt_type}' updated successfully",
            "data": updated_prompt
        }
    except Exception as e:
        logging.error(f"Error updating prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tools")
async def get_tools():
    """Obtiene todas las herramientas"""
    try:
        db = Prisma()
        await db.connect()
        tools = await db.tooldescription.find_many()
        await db.disconnect()
        
        return {
            "status": "success",
            "data": tools
        }
    except Exception as e:
        logging.error(f"Error getting tools: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tools/{tool_name}")
async def update_tool(tool_name: str, tool: ToolDescriptionUpdate):
    """Actualiza una herramienta específica"""
    try:
        db = Prisma()
        await db.connect()
        updated_tool = await db.tooldescription.update(
            where={
                'toolName': tool_name
            },
            data={
                'description': tool.description,
                'supportDescription': tool.supportDescription
            }
        )
        await db.disconnect()
        
        # Actualizar cache
        cache_value = f"{tool.description}||SPLIT||{tool.supportDescription or ''}"
        tool_cache.set(tool_name, cache_value)
        
        logging.info(f"Tool '{tool_name}' updated")
        return {
            "status": "success",
            "message": f"Tool '{tool_name}' updated successfully",
            "data": updated_tool
        }
    except Exception as e:
        logging.error(f"Error updating tool: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))