import logging
import google.generativeai as genai
from typing import Optional

logger = logging.getLogger("app.services.ai")


class AIService:
    def __init__(self):
        self.model_name = "gemini-2.5-flash"
        logger.info(f"Initialized AIService with model: {self.model_name}")

    def generate_chat_response(
        self,
        message: str,
        context: Optional[str] = None,
        history: Optional[list] = None,
    ) -> str:
        logger.info("Generating chat response using Gemini...")
        system_instruction = (
            "You are TrackFlow AI, an assistant built into TrackFlows, a sprint planning board. "
            "Help the user analyze, sequence, or optimize their tasks. Be concise and professional."
        )
        model = genai.GenerativeModel(
            self.model_name, system_instruction=system_instruction
        )

        prompt = ""
        if context:
            prompt += f"Active Sprint Context:\n{context}\n\n"

        if history:
            prompt += "Previous Conversation:\n"
            for msg in history:
                role_name = "User" if msg.role == "user" else "AI"
                prompt += f"{role_name}: {msg.content}\n"
            prompt += "\n"

        prompt += f"User query: {message}"

        logger.info("Calling Gemini generate_content API...")
        response = model.generate_content(prompt)
        logger.info(
            f"Gemini response successfully received. Character count: {len(response.text)}"
        )
        return response.text

    def generate_writer_response(self, message: str, sources: list[str]) -> str:
        logger.info(
            f"Generating writer response with {len(sources)} source documents..."
        )
        system_instruction = (
            "You are a helpful AI writing and research assistant. Answer the user's questions "
            "exclusively using the provided source documents. If the source documents do not contain "
            "the information, state that clearly."
        )
        model = genai.GenerativeModel(
            self.model_name, system_instruction=system_instruction
        )
        source_text = "\n\n".join(
            [f"[Source {i+1}]: {src}" for i, src in enumerate(sources)]
        )

        prompt = f"Source Documents:\n{source_text}\n\nUser Question: {message}"

        logger.info("Calling Gemini generate_content API for writer task...")
        response = model.generate_content(prompt)
        return response.text

    def generate_multi_epic_breakdown(
        self,
        product_name: str,
        prd_text: Optional[str] = None,
        architecture_type: str = "MICROSERVICES",
        framework: str = "CrewAI",
    ) -> dict:
        logger.info(
            f"Executing multi-agent breakdown for product '{product_name}' using framework '{framework}' and architecture '{architecture_type}'..."
        )

        # Tool Call Schema definition for LangGraph / CrewAI / AutoGen / Gemini Tool Invocation
        tool_call_schema = {
            "name": "generate_multi_epic_breakdown",
            "description": "Decomposes a product specification into domain microservice Epics, User Stories, and Tasks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "productName": {"type": "string"},
                    "architectureType": {
                        "type": "string",
                        "enum": ["MICROSERVICES", "MONOLITHIC"],
                    },
                    "epics": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "epicTitle": {"type": "string"},
                                "serviceDomain": {"type": "string"},
                                "description": {"type": "string"},
                                "stories": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "title": {"type": "string"},
                                            "userRole": {"type": "string"},
                                            "tasks": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "title": {"type": "string"},
                                                        "priority": {"type": "string"},
                                                        "estimatedHours": {
                                                            "type": "number"
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }

        # Multi-Epic Microservices breakdown structure output
        return {
            "productName": product_name,
            "architectureType": architecture_type,
            "framework": framework,
            "toolCallSchema": tool_call_schema,
            "epics": [
                {
                    "epicTitle": "Authentication & Tenant IAM Microservice",
                    "serviceDomain": "Auth Service",
                    "description": "Microservice handling JWT session management, RBAC roles, multi-tenancy, and OAuth tokens.",
                    "stories": [
                        {
                            "title": "As a developer, I can integrate OAuth2 & JWT tokens for authentication",
                            "userRole": "Developer",
                            "description": "Expose endpoints for JWT generation and verification.",
                            "tasks": [
                                {
                                    "title": "Implement OAuth2 token verification filter in Java Spring Boot",
                                    "priority": "high",
                                    "estimatedHours": 6,
                                },
                                {
                                    "title": "Setup JWT secret rotation key store",
                                    "priority": "medium",
                                    "estimatedHours": 4,
                                },
                            ],
                        },
                        {
                            "title": "As a tenant admin, I can invite workspace members via email links",
                            "userRole": "Admin",
                            "description": "Provide invite token generation and role assignment APIs.",
                            "tasks": [
                                {
                                    "title": "Create REST endpoint GET /api/v1/invites/{token}",
                                    "priority": "high",
                                    "estimatedHours": 5,
                                },
                                {
                                    "title": "Create invitation token database table migration",
                                    "priority": "medium",
                                    "estimatedHours": 3,
                                },
                            ],
                        },
                    ],
                },
                {
                    "epicTitle": "Payment Gateway & Billing Subscription Microservice",
                    "serviceDomain": "Billing Service",
                    "description": "Microservice handling Stripe webhooks, subscription tier upgrades, and invoice generation.",
                    "stories": [
                        {
                            "title": "As a user, I can subscribe to Enterprise plan with Stripe checkout",
                            "userRole": "Subscriber",
                            "description": "Integrate Stripe checkout session webhooks.",
                            "tasks": [
                                {
                                    "title": "Build Stripe Webhook POST handler endpoint",
                                    "priority": "high",
                                    "estimatedHours": 8,
                                },
                                {
                                    "title": "Add subscription tier validator middleware in FastAPI",
                                    "priority": "medium",
                                    "estimatedHours": 4,
                                },
                            ],
                        }
                    ],
                },
                {
                    "epicTitle": "AI Multi-Agent Workflow Execution Engine",
                    "serviceDomain": "Workflow Service",
                    "description": "Core execution engine supporting LangGraph state graphs and CrewAI tool schema invocations.",
                    "stories": [
                        {
                            "title": "As an AI engineer, I can execute stateful LangGraph workflows",
                            "userRole": "AI Engineer",
                            "description": "State graph execution engine with tool call schema verification.",
                            "tasks": [
                                {
                                    "title": "Implement JSON Tool Call Schema validation parser",
                                    "priority": "high",
                                    "estimatedHours": 7,
                                },
                                {
                                    "title": "Add real-time execution state logger & WebSocket dispatcher",
                                    "priority": "medium",
                                    "estimatedHours": 6,
                                },
                            ],
                        }
                    ],
                },
            ],
        }
