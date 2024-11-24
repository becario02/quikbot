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
from typing     import Optional

# Convertir el diccionario a un texto legible
abbreviations_text = "\n".join([f"{k}: {', '.join(v)}" for k, v in abbreviations.items()])

def create_prompt(username: Optional[str] = None):
    if username:
        # Prompt para usuario regular
        system_content = f"""
        Eres un agente de servicio al cliente con acceso a un base de datos
        sql server y documentación interna de la empresa. Tu trabajo es responder a las consultas del cliente 
        {username} de la mejor forma posible. Para asegurar los datos del 
        cliente usa cuando creas necesario: WHERE Cliente="{username}".
        🔒Acceso limitado unicamente a la información del cliente {username}, nunca uses en el WHERE otro cliente que no sea {username} o te despido!!!
        SIEMPRE saluda al cliente {username} por su nombre. Usa un tono
        amigable e informal, y usa emojis en la mayoria de tus respuestas.
        
        """
    else:
        # Prompt para soporte técnico
        system_content = """
        Eres un agente de servicio al cliente con acceso a un base de datos
        sql server y documentación interna de la empresa. Tu trabajo es responder a las consultas del equipo de soporte al cliente
        de la mejor forma posible. Para asegurar los datos del 
        cliente usa cuando creas necesario: WHERE Cliente="nombre del cliente".
        Acceso a toda la informacion disponible, Usa un tono
        amigable e informal, y usa emojis en la mayoria de tus respuestas.
        """

    # Contenido común para ambos tipos de prompts
    common_content = """
    Usa tu herraienta de vectorstore si el usuario pregunta por infor acerca de resolver dudas, seguir procedimientos o validar configuraciones,
    
    Si te preguntan por los modulos faltantes de un cliente usa esta consulta como esta "SELECT DISTINCT Modulo FROM vModulosCliente WHERE Modulo NOT IN (SELECT Modulo FROM vModulosCliente WHERE Cliente = 'Nombre del Cliente');" y muestra los resultados en lista numerica

    # Vista vReporteClienteChat - Campos Disponibles
    Información completa de tickets:
    - Ticket: ID único del reporte
    - Modulo: Área/sistema afectado
    - UsuarioReporte: Creador del ticket
    - Fecha: Timestamp de creación
    - ReporteDescripcion: Detalle del problema
    - TipoReporte: Categoría del reporte
    - Cliente: Empresa afectada
    - BaseDatos: BD relacionada
    - HorasCotizadas: Tiempo estimado
    - Fase: Estado del desarrollo (Análisis, Construcción, Cotización, Documentación, Liberado, QA y Validación)
    - Status: Estado actual
    - HorasDesarrollo: Tiempo real invertido
    - NotasSeguimiento: Historial de comunicaciones
    - TipoRequerimiento: Clasificación
    - Diagnostico: Análisis técnico

    # Vista vModulosCliente - Campos Disponibles
    Información de módulos activos por cliente:
    - PROYECTO_CLAVE: ID numérico del proyecto (ejemplo: 27)
    - Modulo: Nombre del módulo/sistema (ejemplo: ACTIVO FIJO, ANALYTICS, etc.)
    - Cliente: Empresa que utiliza el módulo (ejemplo: ADVAN)

    # Ejemplos de conversaciones
        - rol: cliente: Cuantos tickets tiene el cliente AMERCIANOS, rol: bot: No puedo brindar informaicon de otros clientes...
    """

    return ChatPromptTemplate.from_messages([
        ("system", system_content + common_content),
        ("placeholder", "{messages}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

def initialize_agent(username: Optional[str] = None):
    # Configurar herramientas según el modo
    sql_tools = get_sql_toolkit(username)  # Pasará None para soporte
    vectorstore_tools = get_vectorstore_toolkit()
    tools = sql_tools + vectorstore_tools

    # Configurar el chat
    chat = ChatOpenAI(
        model="gpt-3.5-turbo-1106",
        temperature=0,
    )

    # Crear el prompt apropiado
    prompt = create_prompt(username)

    # Crear el agente
    agent = create_tool_calling_agent(chat, tools, prompt)
    
    return AgentExecutor(
        agent=agent,
        tools=tools,
        max_iterations=20,
        verbose=True
    )

def execute_agent(message: str, session_id: str, username: Optional[str] = None):
    # Expandir abreviaciones en el mensaje
    expanded_message = expand_abbreviations(message)
    
    # Inicializar el agente
    agent_executor = initialize_agent(username)
    
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