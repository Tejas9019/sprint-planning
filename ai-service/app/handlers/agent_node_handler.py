"""
Single-Responsibility Handler for AI Product Architect & Workflow Nodes (CrewAI, LangGraph, AutoGen).
Adheres to Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).
"""

import logging
from app.handlers.node_handler_interface import (
    NodeHandler,
    NodeExecutionContext,
    NodeExecutionResult,
)
from app.services.agent_engine import AIAgentEngine

logger = logging.getLogger("app.handlers.agent")


class AgentNodeHandler(NodeHandler):
    """Executes AI Product Architect and multi-agent workflow decomposition."""

    def __init__(self):
        self.agent_engine = AIAgentEngine()

    def supports(self, category: str, label: str) -> bool:
        cat_match = category.lower() in ["ai", "agent"]
        label_keywords = [
            "agent",
            "architect",
            "langgraph",
            "crewai",
            "autogen",
            "deconstruct",
        ]
        return cat_match or any(kw in label.lower() for kw in label_keywords)

    def execute(self, context: NodeExecutionContext) -> NodeExecutionResult:
        logger.info(
            f"Executing AgentNodeHandler for node '{context.node_label}' (ID: {context.node_id})"
        )

        config = context.config
        product_name = config.get("productName") or context.input_payload.get(
            "productName", "TrackFlows Core Engine"
        )
        prd_text = config.get("instructions") or context.input_payload.get(
            "prdText", f"Build modern architecture for {product_name}"
        )
        arch_type = config.get("architectureType", "MICROSERVICES")
        framework = config.get("framework", "CrewAI")

        breakdown_res = self.agent_engine.deconstruct_product(
            product_name=product_name,
            prd_text=prd_text,
            architecture_type=arch_type,
            framework=framework,
        )

        epics_count = len(breakdown_res.get("epics", []))
        logger.info(
            f"AI Agent breakdown generated {epics_count} Epics for product '{product_name}'"
        )

        return NodeExecutionResult(
            success=True,
            status="SUCCESS",
            message=f"AI Agent generated {epics_count} Epics using {framework} ({arch_type})",
            output_payload=breakdown_res,
        )
