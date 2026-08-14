import os
import logging
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenAIEmbeddings
import chromadb
from app.core.config import settings

logger = logging.getLogger("app.services.vector_store")

class VectorStoreService:
    def __init__(self):
        # Establish persistent path for ChromaDB
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.persist_directory = os.path.join(base_dir, "chroma_db")
        
        logger.info(f"Initializing ChromaDB client at: {self.persist_directory}")
        self.chroma_client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Initialize Google GenAI Embeddings
        self.embeddings = GoogleGenAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        
        # Get or create the main RAG collection
        self.collection_name = "trackflows_sources"
        self.collection = self.chroma_client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"} # Use cosine similarity
        )
        logger.info("ChromaDB collection initialized successfully.")

    def add_source_document(self, source_id: str, user_id: str, filename: str, content: str):
        logger.info(f"Adding source document {source_id} (user: {user_id}) to vector store...")
        try:
            # 1. Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=150
            )
            chunks = text_splitter.split_text(content)
            logger.info(f"Split source document into {len(chunks)} chunks.")

            if not chunks:
                logger.warning(f"No chunks created for source document {source_id}.")
                return

            # 2. Generate embeddings and store in Chroma
            # We construct IDs, metadata, and embed the text chunks
            ids = [f"{source_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "source_id": source_id,
                    "user_id": user_id,
                    "filename": filename,
                    "chunk_index": i
                } for i in range(len(chunks))
            ]
            
            # Embed all chunks
            embeddings_list = self.embeddings.embed_documents(chunks)

            # Insert into ChromaDB collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings_list,
                documents=chunks,
                metadatas=metadatas
            )
            logger.info(f"Successfully indexed source document {source_id} in ChromaDB.")
        except Exception as e:
            logger.error(f"Failed to add document to vector store: {str(e)}", exc_info=True)
            raise e

    def delete_source_document(self, source_id: str, user_id: str):
        logger.info(f"Deleting source document {source_id} (user: {user_id}) from vector store...")
        try:
            # Delete chunks matching source_id and user_id
            self.collection.delete(
                where={
                    "$and": [
                        {"source_id": source_id},
                        {"user_id": user_id}
                    ]
                }
            )
            logger.info(f"Successfully deleted source document {source_id} from vector store.")
        except Exception as e:
            logger.error(f"Failed to delete document from vector store: {str(e)}", exc_info=True)
            raise e

    def query_context(self, query: str, user_id: str, source_ids: List[str], top_k: int = 5) -> List[str]:
        logger.info(f"Querying vector store for: '{query}' (user: {user_id}, sources: {source_ids})")
        if not source_ids:
            return []
        try:
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)

            # We filter chunks that belong to the active user AND are in the list of selected source_ids
            # ChromaDB supports filtering using dicts
            filter_criteria = {
                "$and": [
                    {"user_id": user_id},
                    {"source_id": {"$in": source_ids}}
                ]
            }

            # Query ChromaDB collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filter_criteria
            )

            # Extract retrieved documents
            documents = []
            if results and 'documents' in results and results['documents']:
                # Chroma query returns a list of lists since we passed a list of query embeddings
                documents = results['documents'][0]
            
            logger.info(f"Retrieved {len(documents)} relevant chunks from vector store.")
            return documents
        except Exception as e:
            logger.error(f"Failed to query vector store: {str(e)}", exc_info=True)
            raise e
