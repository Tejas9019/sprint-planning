import logging
import google.generativeai as genai
from typing import Optional

logger = logging.getLogger("app.services.ai")

class AIService:
    def __init__(self):
        self.model_name = "gemini-2.5-flash"
        logger.info(f"Initialized AIService with model: {self.model_name}")

    def generate_chat_response(self, message: str, context: Optional[str] = None, history: Optional[list] = None) -> str:
        logger.info("Generating chat response using Gemini...")
        system_instruction = (
            "You are TrackFlow AI, an assistant built into TrackFlows, a sprint planning board. "
            "Help the user analyze, sequence, or optimize their tasks. Be concise and professional."
        )
        model = genai.GenerativeModel(
            self.model_name,
            system_instruction=system_instruction
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
        logger.info(f"Gemini response successfully received. Character count: {len(response.text)}")
        return response.text

    def generate_writer_response(self, message: str, sources: list[str]) -> str:
        logger.info(f"Generating writer response with {len(sources)} source documents...")
        system_instruction = (
            "You are a helpful AI writing and research assistant. Answer the user's questions "
            "exclusively using the provided source documents. If the source documents do not contain "
            "the information, state that clearly."
        )
        model = genai.GenerativeModel(
            self.model_name,
            system_instruction=system_instruction
        )
        source_text = "\n\n".join([f"[Source {i+1}]: {src}" for i, src in enumerate(sources)])
        
        prompt = f"Source Documents:\n{source_text}\n\nUser Question: {message}"
        
        logger.info("Calling Gemini generate_content API for writer task...")
        response = model.generate_content(prompt)
        logger.info(f"Gemini response for writer task successfully received. Character count: {len(response.text)}")
        return response.text

