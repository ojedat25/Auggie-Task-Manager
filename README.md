# AuggieTaskManager

Desktop task manager built with **Electron** and **React** (TypeScript), backed by a **Django REST** API and **PostgreSQL**. Users can manage tasks (including Moodle calendar import), profiles, authentication, and study groups.

## Stack


| Layer      | Technologies                                                                      |
| ---------- | --------------------------------------------------------------------------------- |
| Desktop UI | Electron (Electron Forge, Webpack), React 19, TypeScript, Tailwind CSS 4, DaisyUI |
| API        | Django 5.2, Django REST Framework, token authentication                           |
| Database   | PostgreSQL (default: `127.0.0.1:5432`)                                            |


Linting: **Ruff** (Python, config in repo-root `pyproject.toml`), **ESLint** / **Prettier** (frontend `npm run lint` / `npm run format`).

## Prerequisites

- **Node.js** (LTS) and npm ([Node.js downloads](https://nodejs.org/en/download))
- **Python** 3.10+
- **PostgreSQL** running and reachable on port **5432** ([PostgreSQL downloads](https://www.postgresql.org/download/))

## 1. PostgreSQL setup

Create the database role and database Django expects (defaults in `backend/auggietaskmanager/auggietaskmanager/settings.py`: user `auggie`, password `auggie`, database `auggietaskmanager`).

**Windows (PowerShell, `psql`):**

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

On macOS with Homebrew, you can often use `psql postgres` instead of `sudo -u postgres psql`, depending on your install.

## 2. Backend (Django)

Create and use a virtual environment, install dependencies, and apply migrations.

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

Optional: Django admin at [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/):

```bash
cd backend/auggietaskmanager
../venv/bin/python manage.py createsuperuser   # macOS / Linux
# Windows: ..\venv\Scripts\python.exe manage.py createsuperuser
```

The app also exposes REST routes under `/tasks/`, `/users/`, and `/groups/` (see `backend/auggietaskmanager/auggietaskmanager/urls.py`).

## 3. Frontend (Electron + React)

From the repository root:

```bash
cd frontend/AuggieTaskManagerFrontend
npm install
```

On Windows, use `cd frontend\AuggieTaskManagerFrontend`.

## 4. Run the app

The Electron client calls the API at **[http://127.0.0.1:8000](http://127.0.0.1:8000)** by default (`frontend/AuggieTaskManagerFrontend/src/config.ts`). The dev server policy in `forge.config.ts` allows requests to that host. If you change the backend host or port, update `API_BASE` (and CSP `connect-src` if needed).

Start **PostgreSQL**, then run **both** the Django server and the Electron app.

### Option A: VS Code

1. Open the repo in VS Code or Cursor.
2. **Terminal -> Run Task...** (or Command Palette -> **Tasks: Run Task**).
3. Choose **Start App (Windows)** or **Start App (macOS)**.
  - On Windows, **Ctrl+Shift+B** runs the default build task (**Start App (Windows)**).

Two terminals open: Django and Electron. Keep both running while developing.

### Option B: Two terminals manually

**Terminal 1 (Backend)**

Windows:

```powershell
cd backend\auggietaskmanager
..\venv\Scripts\python.exe manage.py runserver
```

macOS / Linux:

```bash
cd backend/auggietaskmanager
../venv/bin/python manage.py runserver
```

This serves the API at [http://127.0.0.1:8000](http://127.0.0.1:8000) by default.

**Terminal 2 (Frontend)**

Windows:

```powershell
cd frontend\AuggieTaskManagerFrontend
npm start
```

macOS / Linux:

```bash
cd frontend/AuggieTaskManagerFrontend
npm start
```

`npm start` runs **Electron Forge** (`electron-forge start`) with the Webpack plugin.

## 5. Linting and formatting

From the **repository root** (with the backend venv activated if `ruff` is only installed there, or install `ruff` globally):

```bash
ruff check backend
ruff format backend
```

Frontend (from `frontend/AuggieTaskManagerFrontend`):

```bash
npm run lint
npm run format
```

## Project layout

- `backend/venv/`: Python virtualenv for Django (create locally; not committed by default).
- `backend/auggietaskmanager/`: Django project (`manage.py`, `auggietaskmanager/settings.py`) and apps such as `moodle` (tasks / Moodle-related API), `users`, `groups`.
- `frontend/AuggieTaskManagerFrontend/`: Electron Forge app (main, preload, React renderer).
- `pyproject.toml`: Ruff configuration for the backend tree.
- `.vscode/tasks.json`: **Start App (Windows)** and **Start App (macOS)** composite tasks (backend + frontend in parallel).

For more detail on the renderer’s folder conventions, see `frontend/AuggieTaskManagerFrontend/README.md`.

