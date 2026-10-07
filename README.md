# Agent Platform — MVP

A production-oriented AI agent platform where companies can create agents that reason over authorized data and execute a controlled set of tools. Demonstrates senior-level AI engineering rather than simply wrapping an LLM API.

## Architecture

```
React (Vite + Tailwind + TanStack Query)
        │
   NestJS API
   ┌────┴────┐
Auth  Agents  Executions  Knowledge  Approvals  Evaluations
        │
  Python Agent Engine (FastAPI)
  ┌─────┼──────┐
Tools   RAG    LLM (Anthropic / pluggable)
        │
   PostgreSQL + pgvector
```

**NestJS owns:** authentication, authorization, multi-tenancy, agent config, tool permissions, execution records, API  
**Python owns:** agent loop, planning, tool selection, context construction, RAG, LLM interaction, structured output

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, Tailwind CSS |
| API | NestJS 10, TypeORM, PostgreSQL, Redis, BullMQ |
| AI Engine | Python 3.12, FastAPI, Pydantic, Anthropic SDK |
| Database | PostgreSQL 16 + pgvector |
| Queue | BullMQ (Redis) |

## Features

- **Multi-tenancy** — every resource is org-scoped; cross-tenant access is impossible
- **Agent builder** — configure name, system prompt, model, temperature, max steps
- **Tool registry** — explicitly registered tools with JSON schemas; `requires_approval` flag
- **Tool permissions** — per-agent allowlist checked before every tool invocation
- **Bounded agent loop** — enforces `max_steps`; graceful termination on overflow
- **Execution tracing** — every step logged (LLM calls, tool calls + inputs/outputs, latency)
- **Human approval** — execution pauses and awaits approval for flagged tools
- **RAG** — document ingestion (Markdown/TXT/PDF) → chunking → embeddings → pgvector
- **Hybrid search** — semantic + keyword with configurable `top_k`
- **Prompt injection defense** — retrieved content is explicitly labelled as DATA, not instructions; tool authorization lives outside the LLM
- **Context management** — configurable context limit; older messages summarised
- **Structured output** — Pydantic-validated JSON responses with one retry on failure
- **LLM provider abstraction** — `generate()` / `stream()` / `count_tokens()` interface; swap providers without touching agent logic
- **Cost tracking** — input/output tokens and estimated USD cost per execution
- **Evaluation framework** — datasets, cases, LLM-as-judge + exact match, pass/fail dashboard
- **RBAC** — Owner / Admin / Member / Viewer roles; only authorised users can create or modify agents
- **Background processing** — long-running executions queued via BullMQ, WebSocket updates
- **Guardrails** — max message length, max conversation size, tool timeouts, max token limits, rate limiting (Redis)

## Getting Started

### Prerequisites

- Node 20+
- Python 3.12+
- PostgreSQL 16 with pgvector extension
- Redis

### 1. Environment

```bash
cp .env .env.local
# Set your ANTHROPIC_API_KEY in .env.local
```

### 2. Database

```bash
psql -U postgres -c "CREATE USER agent_user WITH PASSWORD 'agent_password';"
psql -U postgres -c "CREATE DATABASE agent_platform OWNER agent_user;"
psql -U postgres -d agent_platform -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. API

```bash
cd apps/api
npm install
npm run build
npm start
# Runs on :3100
```

### 4. Agent Engine

```bash
cd apps/agent-engine
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 5. Frontend

```bash
cd apps/web
npm install
VITE_API_URL=http://localhost:3100 npx vite --port 5175
# Open http://localhost:5175
```

### Docker (when docker group access is available)

```bash
docker compose up --build
# Frontend → http://localhost:5173
# API → http://localhost:3001
# Agent Engine → http://localhost:8000
```

## Seed Data

The API seeds on first boot:

| Resource | Count |
|----------|-------|
| Organizations | 1 (Acme Corp) |
| Users | 5 (owner, admin, 2 members, viewer) |
| Agents | 3 (Customer Support, Knowledge Assistant, Sales Assistant) |
| Tools | 5 (get_customer, get_orders, search_knowledge_base, create_support_ticket, send_email) |
| Knowledge bases | 1 (Customer Support Policies) |
| Eval datasets | 1 (50 cases) |

**Demo login:** `owner@acme.com` / `password123`

## API Reference

```
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/agents
POST   /api/v1/agents
GET    /api/v1/agents/:id
PATCH  /api/v1/agents/:id
DELETE /api/v1/agents/:id
GET    /api/v1/agents/:id/tools
POST   /api/v1/agents/:id/tools

GET    /api/v1/tools

POST   /api/v1/agents/:id/executions   (via executions controller)
POST   /api/v1/executions
GET    /api/v1/executions
GET    /api/v1/executions/:id
POST   /api/v1/executions/:id/cancel
GET    /api/v1/executions/metrics

POST   /api/v1/approvals/:id/approve
POST   /api/v1/approvals/:id/reject

POST   /api/v1/knowledge-bases
GET    /api/v1/knowledge-bases/:id/documents
POST   /api/v1/knowledge-bases/:id/documents

POST   /api/v1/evaluations/run
GET    /api/v1/evaluations/results
```

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication |
| `/dashboard` | Metrics overview — executions, success rate, latency, cost |
| `/agents` | Agent list with status |
| `/agents/:id` | Agent config — system prompt, model, tool permissions |
| `/agents/:id/playground` | Chat interface with live execution trace panel |
| `/executions` | Execution history table |
| `/executions/:id` | Full trace timeline with tool inputs/outputs |
| `/knowledge` | Knowledge base and document management |
| `/evaluations` | Eval datasets, run evaluations, view pass rates |
| `/settings` | Account and platform info |

## Security Principles

- The LLM is a **decision component**, not a security boundary
- Tool authorization is enforced in NestJS, never delegated to the LLM
- All tool results and retrieved documents are labelled as untrusted DATA in the system prompt
- Every tool call is validated against the agent's permission list before execution
- No `execute_sql`, `execute_shell`, or open-ended tools are exposed; only narrowly scoped functions

## Demo Scenario

Open the Customer Support Agent playground and ask:

> *"Why is Acme Corp at risk of churning?"*

The agent will:
1. Call `get_customer("Acme")`
2. Call `get_orders("cust_001")`
3. Call `search_knowledge_base("churn indicators")`
4. Analyse the results
5. Return a structured response with status, reasons, and recommended actions

The execution trace panel shows every step live.

## Build Order (Phases)

| Phase | Scope |
|-------|-------|
| 1 | Monorepo, Docker, NestJS, PostgreSQL, Redis, React, Auth |
| 2 | Organizations, Agents, Tools, RBAC, Agent config |
| 3 | Python agent engine, LLM provider, Agent loop, Tool calling, Execution state |
| 4 | Knowledge base, Document ingestion, Embeddings, pgvector, RAG |
| 5 | WebSockets, Execution traces, Human approval, Cost tracking |
| 6 | Prompt injection defenses, Context compaction, Guardrails, Evaluation |
| 7 | Tests, Seed data, Demo scenario, Documentation, UI polish |
