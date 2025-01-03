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
