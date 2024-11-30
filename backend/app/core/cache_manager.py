from typing import Optional, Dict

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
tool_cache   = PromptCache()