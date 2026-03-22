# Daily Growth OS - Backend

## Overview
FastAPI-based backend handling data persistence, insights generation and streak tracking for the Daily Growth OS application.

## Tech Stack
- **Runtime/Language**: Python >= 3.13
- **Framework**: FastAPI 
- **Database**: PostgreSQL >= 16
- **API Documentation**: Auto-generated OpenAPI (Swagger UI)


## Directory Structure
```
/ backend 
├── README.md
├── requirements.txt
├── requirements-dev.txt
└── src
    ├── main.py
    ├── __init__.py
    ├── controllers/
    ├── database/
    ├── models/
    ├── routes/
    ├── schemas/
    ├── services/
    ├── utils/
```

## Database Schema
![Architecture](./.docs/images/architecture.png)

## Installation
1. **Clone the repository**
    ```bash
    git clone git@github.com:varunDevrani/Daily-Growth-OS.git
    cd Daily-Growth-OS/backend
    ```

2. **Create virtual environment**
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3. **Install dependencies**
    ```bash
    python3 -m pip install -r requirements.txt
    python3 -m pip install -r requirements-dev.txt
    ```

4. **Set up PostgreSQL database**
    ```bash
    # Verify PostgreSQL service is running
    systemctl status postgresql

    # Create application database and role
    sudo -i -u postgres
    psql

    # Create a dedicated role
    CREATE ROLE "<user_name>" WITH LOGIN PASSWORD '<password>';

    # Create database owned by the role
    CREATE DATABASE "<db_name>" OWNER "<user_name>";

    # Quit
    \q
    exit

    # reload postgreSQL
    sudo systemctl reload postgresql
    ```

## Environment Variables
Create a `.env` file in the backend directory:
```env
# Server
PORT=

# Database Configuration
DATABASE_URL=
```

## Development
```bash
# Activate virtual environment
source .venv/bin/activate

# Run development server(from backend folder)
uvicorn src.main:app --reload --port 8000
```

## Cleanup
```
python3 src/scripts/clean_pycache.py
```

## API Documentation

### Endpoints

## Testing

