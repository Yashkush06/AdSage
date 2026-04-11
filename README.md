# AdSage — Meta Ads Agent

A production-ready **multi-agent AI system** that autonomously manages Meta advertising campaigns with human-in-the-loop approvals.

## Architecture

```
Frontend (React + TypeScript + Vite)
        ↕ REST API + WebSocket
Backend (Python FastAPI)
        ↕
  AI Agents (Ollama Cloud)   ←→   Demo Data Layer
        ↕
     SQLite DB
```

## Three AI Agents

| Agent | Role |
|-------|------|
| 🔍 Performance Detective | Identifies campaigns with high CPA / low ROAS |
| 💰 Budget Strategist | Reallocates budgets from losers to winners |
| 🚀 Growth Executor | Scales high-ROAS campaigns via duplication |

## Quick Start

### 1. Backend

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Add your OLLAMA_API_KEY to .env (optional — works in demo mode without it)

# Start server (SQLite DB auto-created)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Documentation

Visit [http://localhost:8000/api/docs](http://localhost:8000/api/docs) for interactive Swagger UI.

## Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Get JWT token |
| `GET /api/campaigns` | List demo campaigns |
| `GET /api/analytics/overview` | Aggregate metrics |
| `POST /api/analytics/agents/run-cycle` | Trigger AI agent cycle |
| `GET /api/approvals` | Pending recommendations |
| `POST /api/approvals/{id}/approve` | Approve & execute |
| `POST /api/approvals/{id}/reject` | Reject |
| `WS /ws/{user_id}` | Real-time feed |

## Demo Mode

No real Meta API credentials are needed. The system uses `DemoDataGenerator` to simulate 8 realistic campaign scenarios with improving/declining/stable trends and realistic ROAS/CPA/CTR values.

## Environment Variables

```bash
# Required
DATABASE_URL=sqlite:///./meta_ads_agent.db
SECRET_KEY=your-secret-key

# Optional (AI analysis falls back to mock if blank)
OLLAMA_API_KEY=your_ollama_key
OLLAMA_MODEL=gpt-oss:120b-cloud
```
