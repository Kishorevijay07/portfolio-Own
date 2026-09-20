from typing import List, Optional

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    history: Optional[List[Message]] = None


class Source(BaseModel):
    source: str
    score: Optional[float] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = []
