# ⚡ Agentflow_AI — Agentic AI Operations Automation Platform

An enterprise-grade, full-stack **AI Operations Automation Platform** that enables operators to describe complex workflows in plain English and automatically turns them into executable, visual multi-agent graphs.

The platform executes workflows through a deterministic and autonomous chain of **5 cooperating AI agents**, connects to third-party SaaS tools (**Gmail, Slack, Discord, Google Sheets**) with application-level token encryption (AES-256-GCM), queues background jobs with exponential retry backoff, and streams live multi-agent execution events to the browser in real time via Socket.IO.

---

## 🌟 Key Features & Capabilities

- 🤖 **Prompt-to-Workflow AI Compiler**: Automatically generates complete DAG nodes, coordinates, animated edges, and step configurations from natural language prompts using OpenRouter (LLaMA 3.3 / Claude 3.5), Google Gemini 1.5 Flash, or a deterministic rule-based graph engine.
- 🎨 **Visual Drag-and-Drop Canvas**: Built with **React Flow (`@xyflow/react`)**, featuring custom node components, animated edge flow lines, mini-map navigation, draggable node library palette, and dynamic node configuration inspector.
- 🔄 **5-Agent Cooperating Orchestration Engine**:
  1. **Planner Agent**: Performs topological sort on the workflow DAG, resolves step dependencies, and emits a confidence score.
  2. **Execution Agent**: Executes steps by evaluating dynamic template tags (e.g., `{{nodes.ai_1.output.summary}}`) and invoking external integrations or AI models.
  3. **Validation Agent**: Verifies output schema integrity, field presence, and data correctness.
  4. **Recovery Agent**: Classifies runtime errors (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and applies exponential backoff retries or operator escalations.
  5. **Monitoring Agent**: Persists an immutable timeline audit trail in MongoDB and broadcasts real-time WebSocket events.
- 🔒 **Encrypted Third-Party Integrations**: OAuth & webhook integrations for **Gmail**, **Slack**, **Discord**, and **Google Sheets**. Credentials are encrypted at rest with **AES-256-GCM** using `CREDENTIAL_ENCRYPTION_KEY`.
- ⚡ **Zero-Friction Local Development**: Built-in fallback engines allow the entire platform to boot and run locally without requiring standalone external MongoDB or Redis services installed.
- 📡 **Real-Time Live Timeline**: Watch multi-agent execution events stream into the UI with color-coded agent badges, live node output inspection, and pause/resume/cancel controls.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User([Operator / User]) -->|Natural Language Prompt| AIBuilder[AI Workflow Compiler]
    AIBuilder -->|OpenRouter / Gemini / Rule Engine| DAG[Visual React Flow Canvas]
    DAG -->|Save / Execute| BackendAPI[Express REST API]
    
    subgraph Agentic Orchestration Layer
        BackendAPI --> Planner[1. Planner Agent]
        Planner -->|Topological Plan & Confidence| Executor[2. Execution Agent]
        Executor -->|Run Step & Evaluate Templates| Validator[3. Validation Agent]
        Validator -->|Schema Valid?| Monitor[5. Monitoring Agent]
        Validator -->|Failed Validation / Error| Recovery[4. Recovery Agent]
        Recovery -->|Retry with Backoff| Executor
        Recovery -->|Escalate| Monitor
    end

    subgraph Third-Party Integrations Layer (AES-256 Encrypted)
        Executor --> Gmail[Gmail API]
        Executor --> Slack[Slack API / Webhooks]
        Executor --> Discord[Discord Webhooks / Bot]
        Executor --> Sheets[Google Sheets API]
    end

    subgraph Real-Time & Persistence
        Monitor -->|Socket.IO Events| UIStream[Live Timeline & Notifications]
        Monitor -->|Audit Documents| MongoDB[(MongoDB / Memory Store)]
        BackendAPI --> Queue[(BullMQ Redis / Memory Queue)]
    end
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (`@xyflow/react`), Socket.IO client, Lucide React icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), BullMQ + Redis (via `ioredis` with in-memory fallback), Socket.IO, Helmet, Morgan, Compression, Express-Validator, Bcryptjs (Cost 12), Cryptography (AES-256-GCM).
- **AI Models**: OpenRouter API, Google Generative AI (`@google/genai` & REST), Deterministic DAG Compiler.
- **Integrations**: Gmail, Slack, Discord, Google Sheets.

---

## 🚀 Quick Start & Local Setup Guide

Follow these steps to get the entire platform up and running locally in under 2 minutes.

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on `v20.x` and `v24.x`)
- **npm**: `v9.0.0` or higher

*(Optional: External MongoDB or Redis instances. If not present, the system automatically uses embedded in-memory database and queue fallbacks!)*

---

### 2. Installation

From the project root directory, install all dependencies for root, server, and client:

```bash
# Install root, backend server, and frontend client dependencies
npm run install:all
```

Or install them manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

### 3. Environment Variables Configuration

Copy `.env.example` to `server/.env` (and `.env` in root):

```bash
cp .env.example server/.env
```

Default configuration in `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Database (Leave empty for automatic embedded in-memory MongoDB)
MONGODB_URI=

# Redis (Leave empty or set to redis://localhost:6379 for automatic in-memory queue fallback)
REDIS_URL=

# Security Keys
JWT_SECRET=agentflow_super_secret_jwt_encryption_key_2026_x!
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=agentflow_aes256_credential_key_32_bytes_len!

# AI Providers (Optional - Deterministic rule engine is used if omitted)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

---

### 4. Running the Platform Locally

Start both the backend server and frontend client concurrently with a single command from the root directory:

```bash
npm run dev
```

Alternatively, you can run them in separate terminal windows:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run dev:client
```

---

### 5. Accessing the Application

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

#### Quick Demo Access
You can register a new account on the `/register` page, or click **"Demo Operator Quick Login"** on the `/login` page:
- **Email**: `operator@agentflow.io`
- **Password**: `Password123!`

---

## 📁 Repository Structure

```
Project Folder/
├── client/                          # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/            # Layout, Sidebar, Header, Notification Drawer
│   │   │   ├── MetricGrid/          # Dashboard KPI metrics
│   │   │   ├── NodePalette/         # Draggable visual node library
│   │   │   ├── NodeConfigPanel/     # Node properties sidebar
│   │   │   ├── WorkflowCanvas/      # React Flow canvas & custom node types
│   │   │   └── ProtectedRoute/      # Route guard for authenticated views
│   │   ├── pages/
│   │   │   ├── _app.js              # Global styles & auth initialization
│   │   │   ├── index.js             # Landing page with multi-agent showcase
│   │   │   ├── login.js             # User login page
│   │   │   ├── register.js          # User registration page
│   │   │   ├── dashboard.js         # Operator console & metrics
│   │   │   ├── integrations.js      # OAuth & API integrations manager
│   │   │   ├── settings.js          # Profile & security diagnostics
│   │   │   ├── executions/
│   │   │   │   ├── index.js         # Executions list & filter table
│   │   │   │   └── [id].js          # Real-time multi-agent timeline stream
│   │   │   └── workflows/
│   │   │       ├── index.js         # Workflow catalog & actions
│   │   │       ├── builder.js       # Prompt-to-workflow AI compiler
│   │   │       └── [id].js          # Visual DAG editor & runner
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand auth store with localStorage
│   │   │   └── workflowStore.js     # Zustand React Flow canvas store
│   │   ├── services/
│   │   │   ├── api.js               # Axios client with JWT interceptor
│   │   │   └── socket.js            # Socket.IO client manager
│   │   └── styles/
│   │       └── globals.css          # Tailwind CSS & glassmorphism theme
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                          # Express.js Backend Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # Environment variables validation
│   │   │   ├── db.js                # MongoDB connection + in-memory fallback
│   │   │   └── socket.js            # Socket.IO server & room manager
│   │   ├── models/                  # Mongoose Models
│   │   │   ├── User.js              # Users & bcrypt cost 12 hashing
│   │   │   ├── Workflow.js          # Workflows & graph topologies
│   │   │   ├── Execution.js         # Run snapshots & statuses
│   │   │   ├── ExecutionLog.js      # Granular agent timeline logs
│   │   │   ├── Integration.js       # Encrypted credentials
│   │   │   ├── Notification.js      # System alerts
│   │   │   └── AgentMemory.js       # Cross-step agent context
│   │   ├── agents/                  # Multi-Agent Orchestration Chain
│   │   │   ├── orchestrator.js      # Pipeline coordinator & lifecycle controls
│   │   │   ├── plannerAgent.js      # Kahn's topological sort & confidence score
│   │   │   ├── executionAgent.js    # Step executor & template resolver
│   │   │   ├── validationAgent.js   # Schema & required fields validator
│   │   │   ├── recoveryAgent.js     # Error classifier & backoff retry
│   │   │   └── monitoringAgent.js   # Timeline emitter & audit logger
│   │   ├── integrations/            # Third-Party Integrations
│   │   │   ├── baseIntegration.js   # Abstract provider contract
│   │   │   ├── gmailIntegration.js  # Send & read emails
│   │   │   ├── slackIntegration.js  # Messages & webhooks
│   │   │   ├── discordIntegration.js# Bot messages & embeds
│   │   │   └── googleSheetsIntegration.js # Append & read rows
│   │   ├── services/                # Business Logic Services
│   │   │   ├── authService.js
│   │   │   ├── workflowService.js
│   │   │   ├── executionService.js
│   │   │   ├── aiService.js
│   │   │   ├── integrationService.js
│   │   │   ├── cryptoService.js     # AES-256-GCM encryption
│   │   │   └── notificationService.js
│   │   ├── controllers/             # Thin Request Controllers
│   │   ├── routes/                  # Express REST Routes
│   │   ├── middlewares/             # Auth, validation, error handler
│   │   └── queues/
│   │       └── executionQueue.js    # BullMQ on Redis + Memory fallback
│   ├── package.json
│   └── index.js
│
├── package.json                     # Root npm orchestrator
├── spec.md                          # Comprehensive project specification
└── README.md                        # Documentation & setup guide
```

---

## 📡 REST API Endpoints Reference

### Health & Auth
- `GET /api/health` — System heartbeat and server status check
- `POST /api/auth/register` — Register a new operator account
- `POST /api/auth/login` — Authenticate and issue JWT token
- `GET /api/auth/me` — Fetch authenticated profile

### Workflows
- `GET /api/workflows/dashboard` — Aggregated dashboard KPI metrics
- `GET /api/workflows` — List workflows with search and tag filters
- `POST /api/workflows` — Create a new workflow manually
- `POST /api/workflows/generate` — Generate workflow graph from prompt via AI
- `GET /api/workflows/:id` — Fetch single workflow graph
- `PUT /api/workflows/:id` — Update workflow nodes, edges, and configuration
- `POST /api/workflows/:id/duplicate` — Clone an existing workflow
- `POST /api/workflows/:id/execute` — Trigger an autonomous execution run
- `DELETE /api/workflows/:id` — Delete a workflow

### Executions
- `GET /api/executions` — List all execution runs with pagination
- `GET /api/executions/:id` — Fetch execution snapshot and node outputs
- `GET /api/executions/:id/timeline` — Fetch detailed 5-agent timeline logs
- `POST /api/executions/:id/pause` — Pause an active run
- `POST /api/executions/:id/resume` — Resume a paused run
- `POST /api/executions/:id/cancel` — Cancel a running execution

### Integrations & Notifications
- `GET /api/integrations` — List all user third-party connection states
- `GET /api/integrations/status` — Provider health and token validity checks
- `GET /api/integrations/oauth/:provider/start` — Initiate OAuth flow
- `GET /api/integrations/oauth/:provider/callback` — Handle OAuth redirect callback
- `POST /api/integrations` — Save and encrypt provider credentials (AES-256)
- `DELETE /api/integrations/:provider` — Disconnect provider
- `GET /api/notifications` — Fetch user alert notifications
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `POST /api/notifications/read-all` — Mark all notifications as read

---

## 🧪 Sample Prompts to Try in the AI Builder

Navigate to `/workflows/builder` and test any of the following natural language automations:

1. **Customer Support Triage**:
   > *"When an incoming support ticket arrives, analyze urgency with AI, classify priority (P1/P2/P3), and post an alert to Slack #ops-alerts."*

2. **Invoice Processing & Google Sheets Logging**:
   > *"Extract invoice total, vendor name, and line items from incoming invoice documents, check if amount is over $1,000, and log audit details to Google Sheets."*

3. **Critical Incident Response**:
   > *"When a system error webhook triggers, run diagnostic root cause analysis with AI, and dispatch notifications to Discord and team leads via Gmail."*

---

## 🔒 Security Architecture

- **Password Hashing**: Bcrypt with cost factor `12`.
- **JWT Protection**: Signed HMAC-SHA256 tokens with configurable expiration.
- **Data Encryption at Rest**: AES-256-GCM authenticated cipher with dynamic IV and auth tags for OAuth credentials and API keys.
- **Zero Token Leakage**: Decrypted credentials are never logged or exposed via API response endpoints.
- **HTTP Hardening**: Helmet security headers, CORS origin whitelisting, and rate-limiting on auth endpoints.

---

## Deployment

Deploy the backend as a Render Web Service and the Next.js frontend as a Vercel project. The complete GitHub, Render, Vercel, environment variable, and production verification steps are in [deploy.md](deploy.md).

The production frontend must use:

```env
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://<render-service>.onrender.com
```

Set the backend `CLIENT_URL` to the deployed Vercel URL, and use hosted MongoDB and Redis services for production data and background jobs.

---

## 📄 License
This project is licensed under the MIT License.
