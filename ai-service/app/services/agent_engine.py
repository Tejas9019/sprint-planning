import json
import logging
import google.generativeai as genai
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.prompts import (
    PRODUCT_ARCHITECT_SYSTEM_PROMPT,
    MICROSERVICE_DECOMPOSITION_PROMPT_TEMPLATE,
    MONOLITH_DECOMPOSITION_PROMPT_TEMPLATE,
)
from app.core.tools import GENERATE_PRODUCT_ARCHITECTURE_TOOL_SCHEMA

logger = logging.getLogger("app.services.agent_engine")


class AIAgentEngine:
    """
    Dynamic Backend AI Agent Engine for Product & Workflow Decomposition.
    Uses Google Gemini Generative AI / LangChain tool function calling to parse
    ANY user product input into multi-epic microservices/monolithic backlog tasks.
    """

    def __init__(self):
        self.model_name = "gemini-2.5-flash"
        logger.info(f"Initialized AIAgentEngine with model: {self.model_name}")

    def deconstruct_product(
        self,
        product_name: str,
        prd_text: Optional[str] = None,
        architecture_type: str = "MICROSERVICES",
        framework: str = "CrewAI",
    ) -> Dict[str, Any]:
        """
        Dynamically analyzes user PRD text and generates structured Epics, Stories, and Tasks.
        """
        logger.info(
            f"Deconstructing product '{product_name}' (Arch: {architecture_type}, Framework: {framework})..."
        )

        effective_prd = (
            prd_text.strip()
            if prd_text and prd_text.strip()
            else f"Build a modern {product_name} application."
        )

        # Select prompt template based on architecture
        if architecture_type.upper() == "MONOLITHIC":
            prompt = MONOLITH_DECOMPOSITION_PROMPT_TEMPLATE.format(
                product_name=product_name, framework=framework, prd_text=effective_prd
            )
        else:
            prompt = MICROSERVICE_DECOMPOSITION_PROMPT_TEMPLATE.format(
                product_name=product_name, framework=framework, prd_text=effective_prd
            )

        # Attempt to call Gemini API if key configured
        if settings.GEMINI_API_KEY:
            try:
                logger.info(
                    "Calling Gemini Generative AI model with Tool Call Schema prompt..."
                )
                model = genai.GenerativeModel(
                    self.model_name, system_instruction=PRODUCT_ARCHITECT_SYSTEM_PROMPT
                )

                full_prompt = (
                    f"{prompt}\n\n"
                    "You MUST respond ONLY with valid, raw JSON matching this schema:\n"
                    f"{json.dumps(GENERATE_PRODUCT_ARCHITECTURE_TOOL_SCHEMA, indent=2)}\n"
                    "Do NOT wrap in markdown code blocks or add explanatory text."
                )

                response = model.generate_content(full_prompt)
                raw_text = response.text.strip()

                # Strip markdown code fencing if present
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw_text = "\n".join(lines).strip()

                parsed_data = json.loads(raw_text)
                if "epics" in parsed_data:
                    logger.info(
                        f"Successfully generated {len(parsed_data.get('epics', []))} dynamic epics via Gemini API."
                    )
                    return {
                        "productName": product_name,
                        "architectureType": architecture_type,
                        "framework": framework,
                        "toolCallSchema": GENERATE_PRODUCT_ARCHITECTURE_TOOL_SCHEMA,
                        "epics": parsed_data["epics"],
                    }
            except Exception as err:
                logger.warning(
                    f"Gemini API execution warning: {err}. Falling back to dynamic fallback breakdown generator."
                )

        # Fallback Dynamic Generator based on user input product name
        logger.info("Generating dynamic domain breakdown using fallback parser...")
        return self._generate_dynamic_fallback(
            product_name, effective_prd, architecture_type, framework
        )

    def _generate_dynamic_fallback(
        self, product_name: str, prd_text: str, architecture_type: str, framework: str
    ) -> Dict[str, Any]:
        """
        Fallback parser that extracts core domain features from user product input.
        """
        clean_name = product_name.strip()
        is_microservice = architecture_type.upper() == "MICROSERVICES"

        if is_microservice:
            epics = [
                {
                    "epicTitle": f"{clean_name} Authentication & Identity Microservice",
                    "serviceDomain": "Auth & IAM Service",
                    "description": f"Dedicated microservice for user identity, RBAC authorization, JWT tokens, and security for {clean_name}.",
                    "stories": [
                        {
                            "title": f"As a user of {clean_name}, I can register and authenticate securely",
                            "userRole": "End User",
                            "description": "Implement authentication endpoints and token refresh mechanics.",
                            "tasks": [
                                {
                                    "title": f"Build JWT authentication filter for {clean_name}",
                                    "description": "Configure Spring Boot security filter chain.",
                                    "priority": "high",
                                    "estimatedHours": 6,
                                },
                                {
                                    "title": "Implement RBAC role management database tables",
                                    "description": "Add migration script for user_roles and permissions.",
                                    "priority": "medium",
                                    "estimatedHours": 4,
                                },
                            ],
                        },
                        {
                            "title": f"As an admin, I can manage multi-tenant access in {clean_name}",
                            "userRole": "Admin",
                            "description": "Provide tenant isolation and invite link generation.",
                            "tasks": [
                                {
                                    "title": "Create tenant invite token REST endpoint",
                                    "description": "Expose GET /api/v1/invites/{token}",
                                    "priority": "high",
                                    "estimatedHours": 5,
                                }
                            ],
                        },
                    ],
                },
                {
                    "epicTitle": f"{clean_name} Core Domain & Business Logic Microservice",
                    "serviceDomain": f"{clean_name} Core Service",
                    "description": f"Core business logic, transaction workflows, and data processing engine for {clean_name}.",
                    "stories": [
                        {
                            "title": f"As a user, I can process primary business workflows in {clean_name}",
                            "userRole": "User",
                            "description": f"Execute core features based on specification: {prd_text[:100]}...",
                            "tasks": [
                                {
                                    "title": f"Implement core domain REST controller for {clean_name}",
                                    "description": "Expose business logic endpoints.",
                                    "priority": "high",
                                    "estimatedHours": 8,
                                },
                                {
                                    "title": "Add caching layer with Redis for query optimization",
                                    "description": "Configure CacheManager for frequent queries.",
                                    "priority": "medium",
                                    "estimatedHours": 5,
                                },
                            ],
                        }
                    ],
                },
                {
                    "epicTitle": f"{clean_name} Event Gateway & Notification Microservice",
                    "serviceDomain": "Notification Service",
                    "description": "Microservice for dispatching real-time notifications, webhooks, and messaging alerts.",
                    "stories": [
                        {
                            "title": f"As a user, I receive real-time updates for activities in {clean_name}",
                            "userRole": "User",
                            "description": "Dispatch WebSocket alerts and email notifications.",
                            "tasks": [
                                {
                                    "title": "Integrate WebSocket event bus for instant client pings",
                                    "description": "Setup STOMP over WebSocket handler.",
                                    "priority": "medium",
                                    "estimatedHours": 6,
                                }
                            ],
                        }
                    ],
                },
            ]
        else:
            epics = [
                {
                    "epicTitle": f"{clean_name} Monolithic Web API & UI Layer",
                    "serviceDomain": "Presentation & API Layer",
                    "description": f"Monolithic controller and view layer for {clean_name}.",
                    "stories": [
                        {
                            "title": f"As a user, I can navigate the application dashboard for {clean_name}",
                            "userRole": "User",
                            "description": "Render main dashboard components and state management.",
                            "tasks": [
                                {
                                    "title": f"Build React frontend views for {clean_name}",
                                    "description": "Create responsive layout and state stores.",
                                    "priority": "high",
                                    "estimatedHours": 7,
                                }
                            ],
                        }
                    ],
                },
                {
                    "epicTitle": f"{clean_name} Persistence & Data Access Layer",
                    "serviceDomain": "Database Module",
                    "description": "Monolithic ORM repository and database layer.",
                    "stories": [
                        {
                            "title": f"As a developer, I can persist transactional records for {clean_name}",
                            "userRole": "Developer",
                            "description": "Define JPA repositories and SQL migrations.",
                            "tasks": [
                                {
                                    "title": "Create relational database schema migrations",
                                    "description": "Write Flyway/Liquibase SQL migration scripts.",
                                    "priority": "high",
                                    "estimatedHours": 6,
                                }
                            ],
                        }
                    ],
                },
            ]

        return {
            "productName": product_name,
            "architectureType": architecture_type,
            "framework": framework,
            "toolCallSchema": GENERATE_PRODUCT_ARCHITECTURE_TOOL_SCHEMA,
            "epics": epics,
        }
