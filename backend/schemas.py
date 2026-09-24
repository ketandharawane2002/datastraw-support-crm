from pydantic import BaseModel, EmailStr
from typing import Optional


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: str
    updated_at: str


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None