"""
AI Agent Tool Schemas & Function Calling Definitions for TrackFlows.
Compatible with LangGraph, CrewAI, LangChain, and Gemini Function Calling.
"""

GENERATE_PRODUCT_ARCHITECTURE_TOOL_SCHEMA = {
    "name": "generate_product_architecture",
    "description": "Decomposes any product PRD or user description into structured domain Epics, User Stories, and Tasks.",
    "parameters": {
        "type": "object",
        "properties": {
            "productName": {
                "type": "string",
                "description": "Name of the target product being architected.",
            },
            "architectureType": {
                "type": "string",
                "enum": ["MICROSERVICES", "MONOLITHIC"],
                "description": "Target architectural pattern.",
            },
            "framework": {
                "type": "string",
                "description": "Multi-agent framework used for orchestration (CrewAI, LangGraph, AutoGen).",
            },
            "epics": {
                "type": "array",
                "description": "List of domain service Epics or module Epics.",
                "items": {
                    "type": "object",
                    "properties": {
                        "epicTitle": {
                            "type": "string",
                            "description": "High-level Epic title.",
                        },
                        "serviceDomain": {
                            "type": "string",
                            "description": "Microservice name or functional domain boundary.",
                        },
                        "description": {
                            "type": "string",
                            "description": "Architectural summary of the microservice domain.",
                        },
                        "stories": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {
                                        "type": "string",
                                        "description": "User story in standard format.",
                                    },
                                    "userRole": {
                                        "type": "string",
                                        "description": "Target persona or system actor.",
                                    },
                                    "description": {
                                        "type": "string",
                                        "description": "Acceptance criteria and detailed description.",
                                    },
                                    "tasks": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "type": "string",
                                                    "description": "Concrete technical subtask.",
                                                },
                                                "description": {
                                                    "type": "string",
                                                    "description": "Implementation specifics.",
                                                },
                                                "priority": {
                                                    "type": "string",
                                                    "enum": ["high", "medium", "low"],
                                                },
                                                "estimatedHours": {
                                                    "type": "number",
                                                    "description": "Estimated engineering effort in hours.",
                                                },
                                            },
                                            "required": ["title", "priority"],
                                        },
                                    },
                                },
                                "required": ["title", "tasks"],
                            },
                        },
                    },
                    "required": ["epicTitle", "serviceDomain", "stories"],
                },
            },
        },
        "required": ["productName", "architectureType", "epics"],
    },
}
