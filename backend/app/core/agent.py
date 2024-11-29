from langchain_openai                 import ChatOpenAI
from langchain_core.prompts           import ChatPromptTemplate
from langchain.agents                 import AgentExecutor, create_tool_calling_agent
from langchain_core.messages          import HumanMessage, SystemMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from app.tools.sql_toolkit            import get_sql_toolkit
from app.tools.vectorstore_toolkit    import get_vectorstore_toolkit
from app.core.chat_history            import get_chat_history
from app.utils.abbreviations          import abbreviations, expand_abbreviations
from app.config import settings
from typing     import Optional, Dict, Tuple
from prisma import Prisma

# Cache simple para prompts y descripciones
class PromptCache:
    def __init__(self):
        self._cache: Dict[str, str] = {}

    def get(self, key: str) -> Optional[str]:
        return self._cache.get(key)

    def set(self, key: str, value: str):
        self._cache[key] = value

    def clear(self):
        self._cache.clear()

# Instancias globales del cache
prompt_cache = PromptCache()
tool_cache = PromptCache()

# Convertir el diccionario a un texto legible
abbreviations_text = "\n".join([f"{k}: {', '.join(v)}" for k, v in abbreviations.items()])

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
        where={
            'type': prompt_type
        }
    )
    await db.disconnect()
    
    content = prompt.content if prompt else ""
    # Guardar en cache
    prompt_cache.set(prompt_type, content)
    return content

async def get_tool_description(tool_name: str) -> tuple[str, Optional[str]]:
    """Obtiene la descripción de la herramienta desde la cache o la base de datos"""
    # Intentar obtener desde cache
    cached_desc = tool_cache.get(tool_name)
    if cached_desc is not None:
        # Almacenamos las dos descripciones separadas por un delimitador especial
        desc_parts = cached_desc.split("||SPLIT||")
        return desc_parts[0], desc_parts[1] if len(desc_parts) > 1 else None

    # Si no está en cache, obtener de la base de datos
    db = Prisma()
    await db.connect()
    tool = await db.tooldescription.find_unique(
        where={
            'toolName': tool_name
        }
    )
    await db.disconnect()

    if tool:
        # Guardar en cache usando un delimitador para separar las descripciones
        cache_value = f"{tool.description}||SPLIT||{tool.supportDescription or ''}"
        tool_cache.set(tool_name, cache_value)
        return tool.description, tool.supportDescription
    return "", None

async def create_prompt(username: Optional[str] = None):
    # Obtener prompts de la base de datos
    if username:
        system_content = await get_prompt_content('regular_user')
        # Reemplazar el placeholder de username
        system_content = system_content.replace("{username}", username)
    else:
        system_content = await get_prompt_content('support_user')
    
    # Obtener el contenido común
    common_content = await get_prompt_content('common')

    return ChatPromptTemplate.from_messages([
        ("system", system_content + common_content),
        ("placeholder", "{messages}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

async def initialize_agent(username: Optional[str] = None):
    # Configurar herramientas según el modo
    sql_description, sql_support_description = await get_tool_description('sql_toolkit')
    vectorstore_description, _ = await get_tool_description('vectorstore_toolkit')
    
    # Configurar herramientas según el modo
    sql_tools = await get_sql_toolkit(
        username=username,
        description=sql_support_description if username is None else sql_description
    )
    vectorstore_tools = await get_vectorstore_toolkit(description=vectorstore_description)
    tools = sql_tools + vectorstore_tools

    # Configurar el chat
    chat = ChatOpenAI(
        model="gpt-3.5-turbo-1106",
        temperature=0,
    )

    # Crear el prompt apropiado
    prompt = await create_prompt(username)

    # Crear el agente
    agent = create_tool_calling_agent(chat, tools, prompt)
    
    return AgentExecutor(
        agent=agent,
        tools=tools,
        max_iterations=20,
        verbose=True
    )

async def execute_agent(message: str, session_id: str, username: Optional[str] = None):
    try:
        # Expandir abreviaciones en el mensaje
        expanded_message = expand_abbreviations(message)
        
        # Inicializar el agente
        agent_executor = await initialize_agent(username)
        
        # Configurar el historial de conversación
        conversational_agent_executor = RunnableWithMessageHistory(
            agent_executor,
            get_chat_history,
            input_messages_key="messages",
            output_messages_key="output",
        )
        
        # Invocar el agente
        response = conversational_agent_executor.invoke(
            {
                "messages": [
                    HumanMessage(content=expanded_message)
                ]
            },
            {"configurable": {"session_id": session_id}}
        )
        
        return response['output']
    except Exception as e:
        print(f"Error en execute_agent: {str(e)}")
        raise