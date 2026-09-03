from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    text: str


class WriterChatRequest(BaseModel):
    message: str
    source_ids: List[str]


class WriterChatResponse(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class TaskSchemaItem(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    estimatedHours: Optional[float] = 4.0


class StorySchemaItem(BaseModel):
    title: str
    description: Optional[str] = None
    userRole: Optional[str] = "User"
    tasks: List[TaskSchemaItem] = []


class EpicSchemaItem(BaseModel):
    epicTitle: str
    serviceDomain: str
    description: Optional[str] = None
    stories: List[StorySchemaItem] = []


class MultiEpicBreakdownRequest(BaseModel):
    productName: str
    prdText: Optional[str] = None
    architectureType: Optional[str] = "MICROSERVICES"  # MICROSERVICES or MONOLITHIC
    framework: Optional[str] = "CrewAI"  # CrewAI, LangGraph, AutoGen, LangChain


class MultiEpicBreakdownResponse(BaseModel):
    productName: str
    architectureType: str
    framework: str
    epics: List[EpicSchemaItem]
