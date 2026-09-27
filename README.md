# CYBER-PREDICT 360

**Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance**

- **Problem Statement ID**: 26184
- **Organization**: Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA)
- **Phase**: 1 - Modular Foundation & Architecture Setup

---

## Architecture Overview

CYBER-PREDICT 360 is built as a production-style, modular application using clean architecture principles. Each core layer—Frontend, REST API Backend, Machine Learning Service, and Spatial Database—is strictly decoupled.

```
SIH_20/
├── frontend/             # Next.js 14 + TypeScript + Tailwind CSS UI
│   ├── src/app/          # App Router dashboard & pages
│   ├── src/lib/api.ts    # Service layer & API client
│   └── Dockerfile
├── backend/              # Python FastAPI REST Backend
│   ├── app/main.py       # Core application entrypoint & middleware
│   ├── app/api/v1/       # Versioned API routes (/api/v1)
│   ├── app/core/         # Config & PostGIS database engine
│   └── Dockerfile
├── ml_service/           # Python Machine Learning Inference Engine
│   ├── app/main.py       # ML API service entrypoint
│   ├── app/pipeline/     # Spatial-temporal predictor interface
│   └── Dockerfile
├── db/
│   └── init.sql          # PostGIS extension & spatial indexing script
├── docker-compose.yml    # Multi-container local orchestration
├── .env.example          # Environment configuration template
└── README.md             # Project documentation
```

---

## Tech Stack

1. **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
2. **Backend**: Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2, GeoAlchemy2, Uvicorn
3. **Database**: PostgreSQL 16 + PostGIS 3.4 (`postgis/postgis:16-3.4` container)
4. **ML Service**: Python 3.11, FastAPI, NumPy, Pandas, Scikit-learn
5. **Orchestration**: Docker Compose, Dockerfiles

---

## Security & Data Privacy Compliance

> [!IMPORTANT]
> **Synthetic Data Guardrail**: This prototype does **NOT** use real NCRP, I4C, bank data, or Personally Identifiable Information (PII). All spatial points, complaint acknowledgment IDs, and withdrawal records use mock/synthetic data.

---

## Quick Start (Docker Compose)

The easiest way to run the entire foundation stack locally is using Docker Compose:

### 1. Clone & Setup Environment
```bash
cp .env.example .env
```

### 2. Launch Stack with Docker Compose
```bash
docker-compose up --build
```

### 3. Service Access Points
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Core Backend Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ML Service Docs**: [http://localhost:8001/api/v1/docs](http://localhost:8001/api/v1/docs)
- **PostgreSQL / PostGIS**: `localhost:5432` (`cyberadmin` / `cyberpassword_dev_123`)

---

## Manual Local Development Setup

If running without Docker:

### 1. PostgreSQL + PostGIS
Make sure PostgreSQL with PostGIS extension is installed and running, then execute `db/init.sql`.

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. ML Service (FastAPI)
```bash
cd ml_service
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### 4. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## API Health Check Endpoints

| Service | Endpoint | Description |
| :--- | :--- | :--- |
| **Backend** | `GET /api/v1/health` | Backend status & timestamp |
| **Backend DB** | `GET /api/v1/health/db` | PostgreSQL & PostGIS version check |
| **ML Service** | `GET /api/v1/health` | ML pipeline status & algorithms list |

---

## Next Development Steps (Phase 2 & Beyond)
- Integration of spatial DBSCAN / ST-DBSCAN clustering algorithm in `ml_service`.
- Synthetic complaint ingestion endpoint & ATM proximity probabilistic model scoring.
- Map visualization component (Leaflet / Mapbox integration) on Next.js frontend.
