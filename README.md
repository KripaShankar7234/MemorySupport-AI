# MemorySupport AI 🧠⚡

> **Bengaluru 2.0 Hackathon Project**  
> Agentic Customer Support Copilot with Continuous Long-Term Memory, powered by **Hindsight Cloud**, **Groq Fast Inference**, and **MongoDB Atlas**.

---

## 🌟 Key Architecture

- **Agent Memory System**: [Hindsight Cloud](https://docs.hindsight.vectorize.io/) (`hindsight-client`) for multi-strategy retrieval (semantic, graph, temporal) across customer interactions and support history.
- **Fast Reasoning LLM**: [Groq](https://groq.com) (`groq-python`) running high-speed LLM inference (e.g. `openai/gpt-oss-120b` or `llama-3.1-8b-instant`) for instantaneous context-rich customer support suggestions.
- **Persistent Data Store**: [MongoDB Atlas](https://www.mongodb.com/atlas) (`motor` async) for structured customer profiles, tickets, and conversation sessions.
- **Backend API**: Python FastAPI (`uvicorn`, `pydantic-settings`, async SDK calls).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons.

---

## 📁 Repository Structure

```
MemorySupport-AI/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   └── clients/
│   │       ├── __init__.py
│   │       ├── hindsight_client.py
│   │       ├── groq_client.py
│   │       └── mongo_client.py
│   └── tests/
│       ├── __init__.py
│       ├── test_hindsight.py
│       ├── test_groq.py
│       └── test_mongo.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── index.css
        ├── main.jsx
        └── App.jsx
```

---

## 🚀 Setup & Execution Guide

### 1. Backend Configuration

1. In the `backend` folder, create your `.env` file from `.env.example`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Populate your secret credentials into `backend/.env`:
   - `HINDSIGHT_API_KEY`: Your Hindsight Cloud API key (`hs_...`)
   - `HINDSIGHT_BANK_ID`: `memorysupport-demo`
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `MONGODB_URI`: Your MongoDB Atlas URI (`mongodb+srv://...`)

### 2. Install Backend Dependencies

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Verification & Connection Tests

Run the dedicated connection test scripts:

```bash
# 1. Hindsight Cloud Connection & Memory Bank Test:
python tests/test_hindsight.py

# 2. Groq Fast LLM Inference Test:
python tests/test_groq.py

# 3. MongoDB Atlas Ping & CRUD Test:
python tests/test_mongo.py
```

### 4. Running the Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```
Swagger UI documentation is available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Running the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏆 Hackathon Live Judge Demonstration (2-Minute Script)

1. **Open the AI Support Assistant**:
   - Select **Customer Alpha (Rahul Sharma)**.
   - Click the 1-click test prompt: *"Can you confirm if I'm getting a refund or a replacement for my camera, and will you call me?"*
   - Watch the live **Hindsight Cloud** retrieval expand in the accordion:
     - Recalls damaged smart camera order.
     - Recalls preference for replacement rather than refund.
     - Recalls preference for email updates only (no phone calls).
   - Observe **Groq's grounded response**: confirms warehouse inspection is pending without inventing tracking or delivery dates.

2. **Demonstrate Customer Memory Isolation**:
   - Switch active customer to **Customer Beta (Priya Patel)**.
   - Ask the exact same question: *"What happened to my previous order?"*
   - Observe that **zero memories** are retrieved, and the AI greets Priya as a new customer without leaking Alpha's camera records!

3. **Inspect the Memory Center**:
   - Navigate to **Memory Center** in the sidebar.
   - Walk the judges through the **5-Step Continuous Memory Pipeline** and the **Multi-Tenant Memory Bank Isolation Comparator**.
