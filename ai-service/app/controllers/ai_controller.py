import logging
import uuid
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from app.schemas.ai import ChatRequest, ChatResponse, WriterChatRequest, WriterChatResponse, MessageResponse
from app.services.ai_service import AIService
from app.services.document_parser import DocumentParser
from app.services.vector_store import VectorStoreService
from app.core.config import settings
from app.db.session import get_db
from app.db.models import AIChatMessage
from app.utils.security import get_current_user_id

logger = logging.getLogger("app.controllers.ai")
router = APIRouter()
ai_service = AIService()
vector_store_service = VectorStoreService()

@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if not settings.GEMINI_API_KEY:
        logger.error("Gemini API key is missing in application settings.")
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    try:
        logger.info(f"Received chat request from user: {user_id}")
        
        # 1. Save user message to database
        user_msg = AIChatMessage(user_id=user_id, role="user", content=req.message)
        db.add(user_msg)
        db.commit()
        logger.info(f"Saved user message to DB for user: {user_id}")

        # 2. Get past 20 messages for context
        history = db.query(AIChatMessage)\
            .filter(AIChatMessage.user_id == user_id)\
            .order_by(AIChatMessage.created_at.asc())\
            .limit(20)\
            .all()

        logger.info(f"Retrieved {len(history)} messages of history context for user: {user_id}")

        # 3. Generate response with history
        ans = ai_service.generate_chat_response(req.message, req.context, history=history)

        # 4. Save AI response to database
        ai_msg = AIChatMessage(user_id=user_id, role="ai", content=ans)
        db.add(ai_msg)
        db.commit()
        logger.info(f"Successfully generated and saved AI response to DB for user: {user_id}")

        return ChatResponse(text=ans)
    except Exception as e:
        logger.error(f"Error in chat endpoint for user {user_id}: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history", response_model=List[MessageResponse])
async def get_chat_history(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Fetching chat history for user: {user_id}")
        messages = db.query(AIChatMessage)\
            .filter(AIChatMessage.user_id == user_id)\
            .order_by(AIChatMessage.created_at.asc())\
            .all()
        logger.info(f"Found {len(messages)} past messages for user: {user_id}")
        return messages
    except Exception as e:
        logger.error(f"Error fetching chat history for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/writer/chat", response_model=WriterChatResponse)
async def writer_chat(
    req: WriterChatRequest,
    user_id: str = Depends(get_current_user_id)
):
    if not settings.GEMINI_API_KEY:
        logger.error("Gemini API key is missing in application settings.")
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    try:
        logger.info(f"Received RAG writer chat request from user: {user_id}")
        # Retrieve relevant chunks from vector store using similarity search
        relevant_chunks = vector_store_service.query_context(
            query=req.message,
            user_id=user_id,
            source_ids=req.source_ids
        )
        # Generate Gemini response
        ans = ai_service.generate_writer_response(req.message, relevant_chunks)
        logger.info(f"Successfully generated writer response for user: {user_id}")
        return WriterChatResponse(text=ans)
    except Exception as e:
        logger.error(f"Error in writer chat endpoint for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    try:
        logger.info(f"Received file upload request '{file.filename}' from user: {user_id}")
        content = DocumentParser.parse_document(file.filename, file.file)
        
        # Index document in ChromaDB
        source_id = f"source_{uuid.uuid4()}"
        vector_store_service.add_source_document(
            source_id=source_id,
            user_id=user_id,
            filename=file.filename,
            content=content
        )
        
        return {"id": source_id, "filename": file.filename, "content": content}
    except Exception as e:
        logger.error(f"Error parsing/indexing file upload '{file.filename}': {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/sources/{source_id}")
async def delete_source(
    source_id: str,
    user_id: str = Depends(get_current_user_id)
):
    try:
        logger.info(f"Received delete request for source {source_id} from user: {user_id}")
        vector_store_service.delete_source_document(source_id, user_id)
        return {"status": "success", "message": "Source document removed from vector store"}
    except Exception as e:
        logger.error(f"Error deleting source {source_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


