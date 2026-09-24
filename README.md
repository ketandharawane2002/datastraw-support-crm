# Datastraw Support CRM

A full-stack Customer Support CRM system built as part of the Datastraw Full Stack AI Developer Intern assessment.

The application allows support teams to create, search, filter, view, and update customer support tickets through a clean dashboard interface backed by a REST API and relational database.

## Features

### Core Features

* Create support tickets
* Automatic Ticket ID generation
* Automatic creation and update timestamps
* View all support tickets
* Search tickets by:

  * Customer name
  * Customer email
  * Ticket ID
  * Subject
  * Description
* Filter tickets by status
* View complete ticket details
* Update ticket status
* Add internal support notes
* View ticket activity and notes
* Responsive and professional dashboard UI

### Ticket Statuses

* Open
* In Progress
* Closed

## Bonus Feature

### Internal Activity & Notes

Support agents can add internal notes to individual tickets.

Each note is stored with:

* Ticket ID
* Note content
* Creation timestamp

The ticket details page displays the note history in an activity timeline.

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* Fetch API

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Database

* SQLite
* SQLAlchemy ORM

### Development Tools

* Git
* GitHub
* Visual Studio Code

## System Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│      Vite + Tailwind CSS     │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│      Python + SQLAlchemy     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          SQLite DB           │
│     Tickets + Notes Tables   │
└──────────────────────────────┘
```

## Project Structure

```text
datastraw-support-crm/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Database Design

The application uses two main tables.

### Tickets

Stores customer support ticket information.

| Field            | Description                 |
| ---------------- | --------------------------- |
| `id`             | Internal database ID        |
| `ticket_id`      | Unique ticket identifier    |
| `customer_name`  | Customer name               |
| `customer_email` | Customer email              |
| `subject`        | Ticket subject              |
| `description`    | Issue description           |
| `status`         | Open / In Progress / Closed |
| `created_at`     | Ticket creation time        |
| `updated_at`     | Last update time            |

### Notes

Stores internal support notes.

| Field        | Description        |
| ------------ | ------------------ |
| `id`         | Note ID            |
| `ticket_id`  | Related ticket     |
| `note_text`  | Internal note      |
| `created_at` | Note creation time |

## REST API

### Create Ticket

```http
POST /api/tickets
```

Creates a new support ticket.

Example request:

```json
{
  "customer_name": "Rahul Patil",
  "customer_email": "rahul@example.com",
  "subject": "Unable to login",
  "description": "Customer is unable to login to the support portal."
}
```

### Get All Tickets

```http
GET /api/tickets
```

Returns all tickets.

### Search Tickets

```http
GET /api/tickets?search=Rahul
```

Searches tickets by customer name, email, ticket ID, subject, or description.

### Filter by Status

```http
GET /api/tickets?status=Open
```

Returns tickets matching the selected status.

### Get Ticket Details

```http
GET /api/tickets/{ticket_id}
```

Returns details of a specific ticket.

Example:

```http
GET /api/tickets/TKT-001
```

### Update Ticket

```http
PUT /api/tickets/{ticket_id}
```

Updates ticket status and optionally adds an internal note.

Example request:

```json
{
  "status": "In Progress",
  "note": "Support team is currently investigating the issue."
}
```

### Get Ticket Notes

```http
GET /api/tickets/{ticket_id}/notes
```

Returns internal notes associated with a ticket.

## Local Setup

### Prerequisites

Make sure the following are installed:

* Python 3.13+
* Node.js
* npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/ketandharawane2002/datastraw-support-crm.git
cd datastraw-support-crm
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy pydantic email-validator
```

Start the backend server:

```bash
python -m uvicorn main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## API Health Check

The backend provides a health endpoint:

```http
GET /health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Application Workflow

```text
Create Ticket
      ↓
Ticket Stored in Database
      ↓
Ticket ID Generated
      ↓
Dashboard Displays Ticket
      ↓
Search / Filter
      ↓
Open Ticket Details
      ↓
Update Status
      ↓
Add Internal Note
      ↓
Activity & Notes Updated
```

## Error Handling

The API handles common errors including:

* Ticket not found
* Invalid ticket status
* Invalid email format
* Invalid API requests

Supported ticket statuses are:

* Open
* In Progress
* Closed

## Current Development Status

The following functionality has been implemented and tested:

* Ticket creation
* Ticket listing
* Search
* Status filtering
* Ticket details
* Ticket status updates
* Internal notes
* Activity & Notes display
* REST API
* SQLite database
* Git version control
* GitHub repository
