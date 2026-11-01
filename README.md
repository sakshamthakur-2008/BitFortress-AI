<div align="center">

# 🛡️ BitFortress AI

### Fault-Tolerant Distributed Object Storage with AI Resilience Copilot

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/Groq-Cloud%20LLM-F55036?style=for-the-badge)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*A production-grade simulation of a distributed storage cluster with autonomous AI-powered fault detection, bit-rot repair, and an interactive Groq LLM copilot.*

</div>

---

## ✨ What is BitFortress AI?

BitFortress AI is a full-stack, interactive distributed storage system built to simulate and visualize how platforms like AWS S3, HDFS, or Ceph manage:

- **Multi-node data replication** (3× replication factor across 9 nodes)
- **Autonomous failure detection & self-healing**
- **Bit-rot / silent data corruption via SHA-256 checksums**
- **Live cluster health monitoring** with a real-time React dashboard
- **AI Copilot** powered by Groq Cloud LLM for instant cluster diagnostics and conversational storage intelligence

> **Built for**: Portfolio showcases, systems design demonstrations, and learning distributed storage internals.

---

## 🖥️ Live Demo Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                  │
│  ┌────────────┐ ┌─────────────┐ ┌──────────────────────────┐  │
│  │  Cluster   │ │  Metrics    │ │  AI Copilot (Groq Cloud) │  │
│  │  Topology  │ │  Dashboard  │ │  • Node diagnostics      │  │
│  │  9 Nodes   │ │  Live Stats │ │  • Groq LLM Chat         │  │
│  └────────────┘ └─────────────┘ │  • Auto-Heal / Chaos     │  │
│                                  └──────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────-─┘
                         │ REST API (CORS)
┌────────────────────────▼─────────────────────────────────────-─┐
│                 FastAPI Backend (Port 8000)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │StorageCluster│  │  StorageNode │  │  Repair & Rebalance  │  │
│  │ Coordinator  │  │  9 Instances │  │  Engine              │  │
│  └─────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Features

| Feature | Description |
|---|---|
| **9-Node Cluster Simulation** | Full in-memory distributed cluster with 3× replication |
| **Fault Injection** | Simulate node failures, recoveries, and data corruption on demand |
| **AI Auto-Heal** | Autonomous replica repair with continuous background guard |
| **Groq LLM Copilot** | Ask real-time questions about cluster health using Groq Cloud AI |
| **Live Diagnostics** | Durability gauge, sparkline trends, node health bar charts, storage heatmap |
| **SHA-256 Checksum** | Per-object integrity verification against silent bit-rot |
| **Chaos Engineering** | Drop 2 random nodes simultaneously to stress-test survivability |
| **Event Log** | Chronological audit trail of all cluster events with severity tags |
| **REST API** | Full FastAPI backend with Swagger UI (`/docs`) |
| **Dark UI** | Premium glassmorphism React dashboard with micro-animations |

---

## 📂 Project Structure

```
BitFortress-AI/
├── backend/                    # FastAPI Python backend
│   ├── app.py                  # API routes & server entry point
│   ├── cluster.py              # StorageCluster coordinator
│   ├── node.py                 # StorageNode with replica logic
│   ├── __init__.py
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React dashboard
│   ├── src/
│   │   ├── App.jsx             # Root component & cluster polling
│   │   ├── AICopilot.jsx       # AI Copilot panel (Groq chat + diagnostics)
│   │   ├── ClusterVisualization.jsx  # Interactive 9-node topology
│   │   ├── MetricsDashboard.jsx      # Live metrics & charts
│   │   ├── ControlPanel.jsx          # Node controls & actions
│   │   ├── EventLog.jsx              # Chronological event feed
│   │   ├── components/Icons.jsx      # SVG icon library
│   │   └── services/
│   │       ├── groqService.js        # Groq Cloud LLM integration
│   │       └── aiClusterEngine.js    # Frontend AI engine
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── .env.example                # Root env template (safe to commit)
├── .gitignore                  # Comprehensive ignore rules
└── README.md
```

---

## 🛠️ Setup & Installation

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+ with npm
- A **Groq Cloud** API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone the Repository

```bash
git clone https://github.com/sakshamthakur-2008/BitFortress-AI.git
cd BitFortress-AI
```

---

### 2. Backend Setup

```bash
# Create and activate a Python virtual environment
python -m venv env

# Windows
env\Scripts\activate

# macOS / Linux
source env/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

### 4. Configure Environment Variables

```bash
# From the project root:
cp .env.example .env

# OR from the frontend directory:
cp frontend/.env.example frontend/.env
```

Then open `frontend/.env` and add your Groq API key:

```env
REACT_APP_GROQ_API_KEY=gsk_your_actual_groq_key_here
```

> **Get a free Groq key** → [console.groq.com](https://console.groq.com) → API Keys → Create Key
>
> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

### 5. Run the Application

**Terminal 1 — Start the Backend:**

```bash
# From project root, with venv active
python -m uvicorn backend.app:app --reload --port 8000
```

**Terminal 2 — Start the Frontend:**

```bash
cd frontend
npm start
```

- **Frontend Dashboard** → [http://localhost:3000](http://localhost:3000)
- **Backend API Docs** → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/write` | Write an object (auto-replicated 3×) |
| `GET` | `/api/read/{object_id}` | Read object from any live replica |
| `GET` | `/api/cluster/status` | Full cluster status & all node metrics |
| `POST` | `/api/cluster/node/fail` | Simulate a node failure |
| `POST` | `/api/cluster/node/recover` | Recover a failed node |
| `POST` | `/api/cluster/node/corrupt` | Inject data corruption on a node |
| `POST` | `/api/cluster/repair` | Trigger repair on all nodes |
| `POST` | `/api/cluster/rebalance` | Rebalance data across the cluster |
| `GET` | `/api/cluster/events` | Get recent cluster events |
| `POST` | `/api/demo/stress-test` | Run an automated fault-tolerance demo |
| `GET` | `/api/health` | Health check endpoint |

Full interactive docs at `http://localhost:8000/docs` (Swagger UI).

---

## 🤖 AI Copilot (Groq LLM)

The AI Copilot panel uses **Groq Cloud** with the `qwen/qwen3.8-27b` model (with `openai/gpt-oss-120b` fallback) to provide:

- **Real-time cluster health analysis** based on live telemetry
- **Conversational Q&A** — ask anything about node states, replication risk, quorum
- **Quick prompt chips** — pre-built queries for common scenarios
- **Diagnostics tab** — durability gauge, sparkline, per-node health bars, storage heatmap

The LLM receives live cluster context (node states, durability %, object counts, risk levels) with every query.

---

## 🔒 Security Notes

| File | Status | Reason |
|---|---|---|
| `.env` | ❌ Never commit | Contains real API keys |
| `frontend/.env` | ❌ Never commit | Contains `REACT_APP_GROQ_API_KEY` |
| `.env.example` | ✅ Safe to commit | Template with placeholder values only |
| `frontend/.env.example` | ✅ Safe to commit | Template with placeholder values only |

---

## 🏗️ How It Works

### Data Replication

1. Client writes data → backend picks a **primary node** at random
2. Data is stored on primary with a **SHA-256 checksum**
3. **2 additional replica copies** are spread across different nodes (3× total)
4. On read, any live node holding the object serves the request

### Fault Tolerance

- With 3× replication across 9 nodes, the cluster survives **up to 2 simultaneous node failures** without data loss
- The **durability metric** shows what % of objects still have their full replica count intact
- **Auto-heal** detects degraded replicas and restores them from healthy copies

### Bit-Rot Detection

- Every object is stored with a SHA-256 checksum
- On read, the checksum is recomputed and compared — mismatches flag **silent corruption**
- The AI Copilot can inject corruption to demonstrate detection

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Saksham Thakur](https://github.com/sakshamthakur-2008)

*BitFortress AI — Where data survives everything.*

</div>
