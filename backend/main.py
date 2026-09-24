from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Datastraw Support CRM API",
    description="Customer Support Ticket Management System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Datastraw Support CRM API is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/api/tickets", response_model=schemas.TicketResponse)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(get_db)
):
    ticket_count = db.query(models.Ticket).count()
    ticket_id = f"TKT-{ticket_count + 1:03d}"

    new_ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "ticket_id": new_ticket.ticket_id,
        "customer_name": new_ticket.customer_name,
        "customer_email": new_ticket.customer_email,
        "subject": new_ticket.subject,
        "description": new_ticket.description,
        "status": new_ticket.status,
        "created_at": new_ticket.created_at.isoformat(),
        "updated_at": new_ticket.updated_at.isoformat()
    }


@app.get("/api/tickets", response_model=list[schemas.TicketResponse])
def get_tickets(
    search: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Ticket)

    if search:
        search_term = f"%{search}%"

        query = query.filter(
            (models.Ticket.customer_name.ilike(search_term)) |
            (models.Ticket.customer_email.ilike(search_term)) |
            (models.Ticket.ticket_id.ilike(search_term)) |
            (models.Ticket.subject.ilike(search_term)) |
            (models.Ticket.description.ilike(search_term))
        )

    if status:
        query = query.filter(
            models.Ticket.status == status
        )

    tickets = query.order_by(
        models.Ticket.created_at.desc()
    ).all()

    return [
        {
            "ticket_id": ticket.ticket_id,
            "customer_name": ticket.customer_name,
            "customer_email": ticket.customer_email,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat()
        }
        for ticket in tickets
    ]
@app.get("/api/tickets/{ticket_id}/notes")
def get_ticket_notes(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    notes = db.query(models.Note).filter(
        models.Note.ticket_id == ticket_id
    ).order_by(
        models.Note.created_at.desc()
    ).all()

    return [
        {
            "id": note.id,
            "ticket_id": note.ticket_id,
            "note_text": note.note_text,
            "created_at": note.created_at.isoformat()
        }
        for note in notes
    ]

@app.get("/api/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat(),
        "updated_at": ticket.updated_at.isoformat()
    }


@app.put("/api/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(
    ticket_id: str,
    ticket_update: schemas.TicketUpdate,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Validate status
    if ticket_update.status is not None:
        allowed_statuses = ["Open", "In Progress", "Closed"]

        if ticket_update.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Use Open, In Progress, or Closed."
            )

        ticket.status = ticket_update.status

    # Add note if provided
    if ticket_update.note:
        new_note = models.Note(
            ticket_id=ticket.ticket_id,
            note_text=ticket_update.note
        )

        db.add(new_note)

    # Update timestamp
    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "created_at": ticket.created_at.isoformat(),
        "updated_at": ticket.updated_at.isoformat()
    }