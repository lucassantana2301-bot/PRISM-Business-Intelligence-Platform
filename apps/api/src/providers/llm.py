"""
Provider-Agnostic LLM Protocol Specification
"""

from typing import Protocol, runtime_checkable, Dict, Any
from ..contracts.intent import SemanticIntent, ActiveContext


@runtime_checkable
class BaseLLMProvider(Protocol):
    """
    Decoupled interface for LLM Intelligence Providers (Gemini, Claude, OpenAI).
    """

    async def resolve_intent(
        self,
        query: str,
        context: ActiveContext,
        schema_summary: Dict[str, Any]
    ) -> SemanticIntent:
        """
        Parses natural language input in the context of active session filters into a SemanticIntent.
        """
        ...

    async def generate_narration(
        self,
        intent: SemanticIntent,
        query_results_summary: Dict[str, Any]
    ) -> str:
        """
        Synthesizes a high-density, concise executive narration from analytical results.
        """
        ...
