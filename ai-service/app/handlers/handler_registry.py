"""
Factory Registry Pattern resolving handlers dynamically.
Adheres to Open/Closed Principle (OCP) and Dependency Inversion Principle (DIP).
"""

import logging
from typing import List, Optional
from app.handlers.node_handler_interface import (
    NodeHandler,
    NodeExecutionContext,
    NodeExecutionResult,
)
from app.handlers.auth_node_handler import AuthNodeHandler
from app.handlers.payment_node_handler import PaymentNodeHandler
from app.handlers.agent_node_handler import AgentNodeHandler

logger = logging.getLogger("app.handlers.registry")


class HandlerRegistry:
    """Registry maintaining decoupled NodeHandler strategy implementations."""

    def __init__(self):
        self._handlers: List[NodeHandler] = [
            AuthNodeHandler(),
            PaymentNodeHandler(),
            AgentNodeHandler(),
        ]
        logger.info(
            f"HandlerRegistry initialized with {len(self._handlers)} Strategy Handlers."
        )

    def register_handler(self, handler: NodeHandler) -> None:
        """Dynamically registers a new NodeHandler strategy (Open/Closed Principle)."""
        self._handlers.append(handler)
        logger.info(f"Registered new NodeHandler: {handler.__class__.__name__}")

    def resolve_handler(self, category: str, label: str) -> Optional[NodeHandler]:
        """Finds the matching handler supporting the given node category and label."""
        for handler in self._handlers:
            if handler.supports(category, label):
                return handler
        return None

    def execute_node(self, context: NodeExecutionContext) -> NodeExecutionResult:
        """Resolves the appropriate handler and executes the context step."""
        handler = self.resolve_handler(context.category, context.node_label)
        if handler:
            return handler.execute(context)

        logger.warning(
            f"No specific handler found for '{context.node_label}' (category: {context.category}). Executing default pass-through."
        )
        return NodeExecutionResult(
            success=True,
            status="SUCCESS",
            message=f"Pass-through step completed for node '{context.node_label}'",
            output_payload=context.input_payload,
        )
