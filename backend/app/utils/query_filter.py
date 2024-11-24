def decode_unicode(query: str) -> str:
    # Mapeo de secuencias Unicode a caracteres acentuados
    unicode_map = {
        # Vocales minúsculas con acento
        '\\u00e1': 'á',  # a con acento
        '\\u00e9': 'é',  # e con acento
        '\\u00ed': 'í',  # i con acento
        '\\u00f3': 'ó',  # o con acento
        '\\u00fa': 'ú',  # u con acento
        # Vocales mayúsculas con acento
        '\\u00c1': 'Á',  # A con acento
        '\\u00c9': 'É',  # E con acento
        '\\u00cd': 'Í',  # I con acento
        '\\u00d3': 'Ó',  # O con acento
        '\\u00da': 'Ú',  # U con acento
        # Ñ y ñ
        '\\u00f1': 'ñ',  # ñ minúscula
        '\\u00d1': 'Ñ',  # Ñ mayúscula
        # Diéresis
        '\\u00fc': 'ü',  # u con diéresis
        '\\u00dc': 'Ü'   # U con diéresis
    }
    
    # Reemplazar cada secuencia Unicode por su carácter correspondiente
    result = query
    for unicode_seq, char in unicode_map.items():
        result = result.replace(unicode_seq, char)
    
    return result

def apply_customer_filter(query: str, username: str) -> str:

    # Detectar si es una consulta de módulos faltantes
    is_missing_modules_query = (
        "SELECT DISTINCT Modulo FROM vModulosCliente WHERE Modulo NOT IN" in query and
        "FROM vModulosCliente WHERE Cliente =" in query
    )
    
    if is_missing_modules_query:
        # Construir una nueva consulta que compare contra todos los módulos existentes
        return f"""
        SELECT DISTINCT m1.Modulo
        FROM vModulosCliente m1
        WHERE m1.Modulo NOT IN (
            SELECT DISTINCT m2.Modulo 
            FROM vModulosCliente m2 
            WHERE m2.Cliente = '{username}'
        )
        """
    
    # Para todas las demás consultas, mantener la lógica original
    if "WHERE" in query.upper():
        return query.replace("WHERE", f"WHERE Cliente = '{username}' AND")
    else:
        from_pos = query.upper().find("FROM")
        if from_pos != -1:
            space_after_from = query.find(" ", from_pos + 5)
            if space_after_from == -1:
                space_after_from = len(query)
            return f"{query[:space_after_from]} WHERE Cliente = '{username}' {query[space_after_from:]}"
        return query