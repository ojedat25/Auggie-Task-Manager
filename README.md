# AuggieTaskManager

Electron desktop app with a Django REST backend and React frontend. The app spawns the Django server automatically when you run it.

## Prerequisites

- **Node.js** (LTS) and npm — [Download](https://nodejs.org/en/download/current)
- **Python** 3.10+
- **PostgreSQL** (server running on port 5432) — [Download](https://www.postgresql.org/download/)

## 1. PostgreSQL setup

Create the database and user that Django uses (defaults in `backend/auggietaskmanager/auggietaskmanager/settings.py`: user `auggie`, password `auggie`, database `auggietaskmanager`).

**Windows (psql in a terminal):**

```powershell
# Connect as a superuser (e.g. postgres). Use the password you set for the postgres user.
psql -U postgres 

# In the psql prompt:
CREATE USER auggie WITH PASSWORD 'auggie';
CREATE DATABASE auggietaskmanager OWNER auggie;
GRANT ALL PRIVILEGES ON DATABASE auggietaskmanager TO auggie;
\c auggietaskmanager
GRANT ALL ON SCHEMA public TO auggie;
\q
```

**macOS / Linux:**

```bash
sudo -u postgres psql

# In the psql prompt:
CREATE USER auggie WITH PASSWORD 'auggie';
CREATE DATABASE auggietaskmanager OWNER auggie;
GRANT ALL PRIVILEGES ON DATABASE auggietaskmanager TO auggie;
\c auggietaskmanager
GRANT ALL ON SCHEMA public TO auggie;
\q
```

## 2. Backend (Django)

Create virtual environment.

**Windows:**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
cd auggietaskmanager
pip install -r requirements.txt
python manage.py migrate
cd ..\..
```

**macOS / Linux:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
cd auggietaskmanager
pip install -r requirements.txt
python manage.py migrate
cd ../..
```

## 3. Frontend (Electron + React)

From the repo root:

```powershell
cd frontend\AuggieTaskManagerFrontend
npm install
```

**macOS / Linux:** use `cd frontend/AuggieTaskManagerFrontend` and `npm install`.

## 4. Run the app

From the repo root:

```powershell
cd frontend\AuggieTaskManagerFrontend
npm start
```

**macOS / Linux:** `cd frontend/AuggieTaskManagerFrontend` then `npm start`.

This starts Electron; the main process will start Django (`python manage.py runserver`) automatically. You do not need to run the backend in a separate terminal.

## Project layout

- `backend/venv` — Python virtualenv for Django
- `backend/auggietaskmanager/` — Django project (e.g. `manage.py`, `auggietaskmanager/settings.py`)
- `frontend/AuggieTaskManagerFrontend/` — Electron + Webpack + React app; run `npm start` here
