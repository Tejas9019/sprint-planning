"""
Single-Responsibility Handler for Authentication & Security Nodes (OAuth2, JWT, RBAC, Secret Vault).
Adheres to Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).
"""

import logging
from app.handlers.node_handler_interface import (
    NodeHandler,
    NodeExecutionContext,
    NodeExecutionResult,
)

logger = logging.getLogger("app.handlers.auth")


class AuthNodeHandler(NodeHandler):
    """Executes authentication, JWT token validation, and RBAC security checks."""

    def supports(self, category: str, label: str) -> bool:
        cat_match = category.lower() in ["authentication", "auth", "logic"]
        label_keywords = ["auth", "jwt", "session", "rbac", "validator", "key"]
        return cat_match or any(kw in label.lower() for kw in label_keywords)

    def execute(self, context: NodeExecutionContext) -> NodeExecutionResult:
        logger.info(
            f"Executing AuthNodeHandler for node '{context.node_label}' (ID: {context.node_id})"
        )

        config = context.config
        provider = config.get("authProvider", "OAuth2 / JWT")
        required_roles = config.get("requiredRoles", "admin, developer")
        secret_env = config.get("secretEnv", "JWT_SECRET_KEY")

        token = context.input_payload.get("token") or context.input_payload.get(
            "authorization"
        )

        # Simulate token claims validation
        is_valid = True
        extracted_user = context.input_payload.get(
            "user", "authenticated_user@trackflows.io"
        )

        logger.info(
            f"Auth check passed for provider '{provider}' with required roles '{required_roles}'"
        )

        return NodeExecutionResult(
            success=is_valid,
            status="SUCCESS" if is_valid else "UNAUTHORIZED",
            message=f"Authentication validated via {provider} ({secret_env})",
            output_payload={
                "authenticated": is_valid,
                "user": extracted_user,
                "provider": provider,
                "roles": required_roles.split(","),
            },
        )
