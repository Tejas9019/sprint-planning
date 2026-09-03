"""
Interface contract for workflow node execution handlers.
Adheres to Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP).
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class NodeExecutionContext(BaseModel):
    node_id: str
    node_label: str
    category: str
    config: Dict[str, Any] = {}
    input_payload: Dict[str, Any] = {}


class NodeExecutionResult(BaseModel):
    success: bool
    status: str
    message: str
    output_payload: Dict[str, Any] = {}


class NodeHandler(ABC):
    """Abstract Strategy interface for executing workflow node steps."""

    @abstractmethod
    def supports(self, category: str, label: str) -> bool:
        """Determines if this handler supports the given category and node label."""
        pass

    @abstractmethod
    def execute(self, context: NodeExecutionContext) -> NodeExecutionResult:
        """Executes the specific node logic and returns structured result."""
        pass
