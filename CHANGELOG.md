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

### 2025-10-05

**feat: structured Pydantic output with one retry on validation failure**

AgentStep validated against Pydantic model. One retry with error context if validation fails.

### 2025-10-25

**feat: prompt injection defense labeling retrieved content as DATA**

RAG results wrapped in data tags. System prompt instructs LLM to treat data as untrusted content.

### 2025-11-06

**feat: BullMQ queue for long-running agent executions**

Executions queued via BullMQ. Processor calls Python engine via HTTP. WebSocket updates sent from processor.

### 2025-11-21

**feat: agent playground page with live execution trace panel**

Split pane: chat on left, execution trace timeline on right. Steps appear in real time via WebSocket.

### 2025-11-29

**fix: resolve agent loop not terminating when max_steps reached**

Loop was checking steps_taken > max_steps instead of >=. Off-by-one caused one extra LLM call.

### 2025-12-10

**fix: fix pgvector cosine distance query returning wrong neighbors**

Was using L2 distance operator instead of cosine distance. Fixed to use cosine for text embeddings.

### 2025-12-17

**feat: execution cancel endpoint with graceful engine signal**

POST /api/v1/executions/:id/cancel sets status to cancelling. Engine checks flag between steps.

### 2026-01-03

**feat: execution metrics dashboard with success rate latency cost**

Dashboard cards: total executions, success rate %, avg latency ms, total cost USD this month.

### 2026-01-04

**feat: seed data with 3 agents 5 tools and 1 knowledge base**

Seeds: Customer Support, Knowledge Assistant, Sales Assistant agents with tools and eval dataset.

### 2026-01-12

**fix: resolve tool timeout not propagating to Python engine**

NestJS was passing timeout_seconds but engine was ignoring it. Added asyncio.wait_for with timeout.

### 2026-01-13

**feat: knowledge base document chunking progress indicator**

Document upload shows progress bar. WebSocket events document.chunking and document.ready update UI.

### 2026-02-06

**perf: add pgvector HNSW index for faster embedding search**

CREATE INDEX USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=64). 5x faster KNN.

### 2026-02-18

**fix: fix approval timeout leaving execution in running state**

ApprovalRequest expiry now transitions execution to failed with timeout reason.

### 2026-03-19

**refactor: extract tool executor to dedicated Python module**

tools/executor.py handles tool dispatch, validation, timeout, and error normalization.

### 2026-03-19

**feat: token count estimation shown before starting execution**

POST /api/v1/agents/:id/estimate returns estimated tokens and cost before execution starts.

### 2026-03-20

**fix: resolve concurrent execution lock contention on agent**

Two concurrent executions for same agent were deadlocking. Added per-agent Redis lock with TTL.
