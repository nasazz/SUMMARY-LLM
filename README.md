# 📄 SUMMARY-GEN: AI Document Analysis Workspace

SUMMARY-GEN is a high-performance, N-Layered web application built with **FastAPI** and **Angular**. It allows users to upload PDF documents, extract text automatically, and generate AI-driven summaries and keywords using Google Gemini or OpenAI.

---

## 🛠️ Technology Stack
- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Angular 18+ (PrimeNG + TailwindCSS)
- **Database**: SQL Server (via SQLAlchemy)
- **Worker**: Celery + Redis (Message Broker)
- **AI**: Google Gemini (Direct) or OpenAI

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Redis)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express or Developer edition)

### 2. Infrastructure Setup (Redis & DB)
Run Redis via Docker:
```bash
docker run -d -p 6379:6379 --name summary_redis_local redis:alpine
```
Ensure your SQL Server is running and you have a database named `FastApiDb`.

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd FastApiBoilerplate
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   Copy `.env.example` to `.env` and fill in your **DATABASE_URL** and **OPENAI_API_KEY** (Gemini key).
   ```bash
   cp .env.example .env
   ```

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Angular-Boilerplate
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

For a full end-to-end flow, you need **four** terminals running:

| Terminal | Path | Command |
| :--- | :--- | :--- |
| **1. API Server** | `FastApiBoilerplate/` | `uvicorn src.main:app --reload` |
| **2. Celery Worker** | `FastApiBoilerplate/` | `venv\Scripts\celery.exe -A src.core.celery_app worker --loglevel=info --pool=solo` |
| **3. Flower (Monitor)** | `FastApiBoilerplate/` | `venv\Scripts\celery.exe -A src.core.celery_app flower --port=5555` |
| **4. Frontend** | `Angular-Boilerplate/` | `npm start` |

---

## 📈 Monitoring & Access
- **Frontend UI**: [http://localhost:4200](http://localhost:4200)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Task Monitor (Flower)**: [http://localhost:5555](http://localhost:5555)

---

## 🔒 Security Note
Never commit your `.env` file. A `.gitignore` is already configured to protect your API keys and local environment settings. Always use the `.env.example` as a template for new environments.
