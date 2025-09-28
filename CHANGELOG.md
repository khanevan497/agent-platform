# Changelog

All notable changes to this project are documented here.

### 2024-10-15

**feat: NestJS API with PostgreSQL TypeORM and Redis**

Monorepo with apps/api (NestJS), apps/web (React), apps/agent-engine (FastAPI). Shared docker-compose.

### 2024-11-12

**feat: React frontend with Vite TanStack Query and Tailwind**

React 18 with Vite, TanStack Query for server state, Tailwind for styling. Zustand for auth store.

### 2024-11-25

**feat: Python FastAPI agent engine scaffold**

FastAPI app with /execute endpoint. Receives agent config and message, returns execution steps.

### 2024-12-16

**feat: Anthropic SDK integration with Claude as default LLM**

AnthropicProvider implements BaseLLMProvider. Uses claude-sonnet-4-6 by default. Configurable per agent.

### 2024-12-31

**feat: LLM provider abstraction with generate stream count_tokens**

BaseLLMProvider defines generate(), stream(), count_tokens() interface. Providers are swappable.

### 2025-01-03

**feat: agent builder with name system prompt model and temperature**

Agent config stored in PostgreSQL. Includes name, system_prompt, model, temperature, max_steps.

### 2025-01-22

**feat: tool registry with JSON schema definitions per tool**

Tools defined with name, description, input_schema (JSON Schema). Engine uses schema for LLM tool calling.

### 2025-01-23

**feat: per-agent tool permission allowlist checked before invocation**

AgentTool join table lists permitted tools per agent. Engine validates before every tool call.

### 2025-01-25

**feat: bounded agent loop enforcing max_steps with graceful exit**

Loop exits with graceful_stop reason after max_steps. Returns partial result with all steps so far.

### 2025-02-02

**feat: execution state machine pending running completed failed**

Execution transitions: pending -> running -> completed/failed/cancelled. Stored in PostgreSQL.

### 2025-02-08

**feat: full execution step tracing for LLM calls and tool calls**

Every step logged: type (llm/tool), input, output, latency_ms, token counts. Accessible via API.

### 2025-03-26

**feat: document ingestion pipeline supporting Markdown TXT and PDF**

Documents chunked, embedded via Anthropic embeddings API, stored in pgvector.

### 2025-04-16

**feat: text chunking with configurable overlap for embedding**

Chunks split at paragraph boundaries. Configurable chunk_size and overlap. Default 512/50 tokens.

### 2025-04-20

**feat: pgvector integration for storing and querying embeddings**

vector(1536) column on documents table. KNN queries using cosine distance operator.

### 2025-04-29

**feat: hybrid semantic and keyword search with configurable top_k**

Semantic search via pgvector plus keyword search via pg_trgm. Results merged with RRF scoring.

### 2025-04-30

**feat: human approval flow pausing execution on flagged tools**

Tool with requires_approval=true creates ApprovalRequest. Engine polls until approved or rejected.

### 2025-07-15

**feat: WebSocket real-time execution step streaming**

NestJS emits execution.step events to agent room. Playground page renders steps as they arrive.

### 2025-07-30

**feat: cost tracking for input output tokens and estimated USD**

Token counts from Anthropic API response. USD cost computed from token counts and per-model pricing.

### 2025-08-01

**feat: LLM-as-judge evaluation framework**

Evaluator sends (question, expected, actual) to judge prompt. Judge returns pass/fail with reasoning.

### 2025-08-13

**feat: exact match scorer for evaluation cases**

Normalizes strings (lowercase, strip whitespace) before comparison. Used for factual answer cases.

### 2025-08-30

**feat: evaluation dataset management with 50-case seed**

Datasets have name and array of cases. Seed dataset has 50 customer support Q&A cases.

### 2025-09-04

**feat: RBAC with Owner Admin Member Viewer roles**

Owner can create agents. Admin can edit agents. Member can run agents. Viewer can read only.

### 2025-09-28

**feat: context compaction by summarizing older messages**

When conversation exceeds context_limit tokens, older messages replaced with LLM-generated summary.
