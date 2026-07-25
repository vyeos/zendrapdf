from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
import logging
logger = logging.getLogger(__name__)
from langchain_pinecone import PineconeVectorStore
from pydantic import BaseModel
from app.config import index, cfEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()
secret = os.getenv("secret")

vector_store = PineconeVectorStore(
    embedding=cfEmbeddings,
    index=index
)

router = APIRouter(
    prefix='/context',
    tags=["context"]
)

class RemoveRequest(BaseModel):
    filename: str
    pdfId: str
    userId: str

@router.post('/remove')
async def remove(req: RemoveRequest, secret1: str = Header(...)):
    try:
        vector_store.delete(filter={
            "filename": req.filename,
            "pdfId": req.pdfId,
            "userId": req.userId
        })
        return {"message": "Context removed successfully"}
    except Exception as e:    
        logger.error(
            f"Error processing request in remove context: {str(e)}", 
            exc_info=True
        )
        return JSONResponse(status_code=500, content={"message": str(e)})