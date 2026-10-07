from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class AgentConfig(BaseModel):
    id: str
    name: str
    system_prompt: Optional[str] = None
    model: str = "claude-sonnet-4-6"
    temperature: float = 0.7
    max_steps: int = 8
    max_tokens: int = 4096


class ToolConfig(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    input_schema: Dict[str, Any] = {}
    requires_approval: bool = False
    endpoint: Optional[str] = None
    config: Dict[str, Any] = {}


class ExecuteRequest(BaseModel):
    execution_id: str
    agent: AgentConfig
    input: str
    tools: List[ToolConfig] = []


class ExecuteResult(BaseModel):
    execution_id: str
    status: str
    output: Optional[str] = None
    step_count: int = 0
    token_usage: Dict[str, Any] = {}
    estimated_cost: float = 0.0
    trace: List[Dict[str, Any]] = []
    error: Optional[str] = None


class IngestRequest(BaseModel):
    document_id: str
    knowledge_base_id: str
    content: str
    title: str
    document_type: str = "txt"


class TraceEvent(BaseModel):
    timestamp: str
    type: str
    data: Dict[str, Any] = {}
