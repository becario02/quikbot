from langchain_openai                 import ChatOpenAI
from langchain_core.prompts           import ChatPromptTemplate
from langchain.agents                 import AgentExecutor, create_tool_calling_agent
from langchain_core.messages          import HumanMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from app.tools.sql_toolkit            import get_sql_toolkit
from app.tools.vectorstore_toolkit    import get_vectorstore_toolkit
from app.core.chat_history            import get_chat_history
from app.utils.abbreviations          import abbreviations, expand_abbreviations
from app.core.prompt_manager          import get_prompt_content, get_tool_description
from typing                           import Optional

# Convertir el diccionario a un texto legible
abbreviations_text = "\n".join([f"{k}: {', '.join(v)}" for k, v in abbreviations.items()])

async def create_prompt(username: Optional[str] = None):
    if username:
        system_content = await get_prompt_content('regular_user')
        system_content = system_content.replace("{username}", username)
    else:
        system_content = await get_prompt_content('support_user')
    
    common_content = await get_prompt_content('common')

    return ChatPromptTemplate.from_messages([
        ("system", system_content + common_content),
        ("placeholder", "{messages}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

async def initialize_agent(username: Optional[str] = None):
    # Configurar herramientas según el modo
    sql_description = await get_tool_description('sql_toolkit')
    vectorstore_description = await get_tool_description('vectorstore_toolkit')
    
    # Configurar herramientas según el modo
    sql_tools = await get_sql_toolkit(username=username, description=sql_description)
    vectorstore_tools = await get_vectorstore_toolkit(description=vectorstore_description)
    tools = sql_tools + vectorstore_tools

    # Configurar el chat
    chat = ChatOpenAI(model="gpt-4-1106-preview", temperature=0)

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