from prisma import Prisma
from .cache_manager import prompt_cache, tool_cache

async def get_prompt_content(prompt_type: str) -> str:
    """Obtiene el contenido del prompt desde la cache o la base de datos"""
    # Intentar obtener desde cache
    cached_content = prompt_cache.get(prompt_type)
    if cached_content is not None:
        return cached_content

    # Si no está en cache, obtener de la base de datos
    db = Prisma()
    await db.connect()
    prompt = await db.agentprompt.find_unique(
        where={'type': prompt_type}
    )
    await db.disconnect()
    
    content = prompt.content if prompt else ""
    prompt_cache.set(prompt_type, content)
    return content

async def get_tool_description(tool_name: str) -> str:
    """Obtiene la descripción de la herramienta desde la cache o la base de datos"""
    # Intentar obtener desde cache
    cached_desc = tool_cache.get(tool_name)
    if cached_desc is not None:
        return cached_desc

    # Si no está en cache, obtener de la base de datos
    db = Prisma()
    await db.connect()
    tool = await db.tooldescription.find_unique(
        where={'toolName': tool_name}
    )
    await db.disconnect()

    description = tool.description if tool else ""
    tool_cache.set(tool_name, description)
    return description