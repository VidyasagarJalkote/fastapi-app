# Simple FastAPI + React App

A small items manager: FastAPI backend (`/app`) and React UI (`/frontend`).
FastAPI serves the built UI, so you deploy a single service.

## Run it (production-style)
The UI is already built in `frontend/dist`, so you only need Python:
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000 for the UI and http://127.0.0.1:8000/docs for the API docs.

## Develop the UI (hot reload)
Terminal 1: `uvicorn app.main:app --reload`
Terminal 2:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Requests to `/api` are proxied to FastAPI.

After changing the UI, run `npm run build` inside `frontend/` to update `frontend/dist`.

## Deploy
- **Docker:** `docker build -t fastapi-app . && docker run -p 8000:8000 fastapi-app`
  (the Dockerfile builds the React app for you).
- **Render / Railway / Heroku (Python):** keep `frontend/dist` in the repo and use
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (see `Procfile`).

## API
- `GET /health`
- `GET /api/items`, `POST /api/items`
- `GET /api/items/{id}`, `PUT /api/items/{id}`, `DELETE /api/items/{id}`

Data is stored in memory and resets on restart. Use a database for real data.
