import httpx
import asyncio
import logging
from typing import Dict, Any, Optional
from agent.models import ToolConfig

logger = logging.getLogger(__name__)

MOCK_DATA = {
    "customers": {
        "acme": {"id": "cust_001", "name": "Acme Corp", "email": "contact@acme.com", "status": "at_risk", "plan": "enterprise", "mrr": 5000, "since": "2022-03-15"},
        "globex": {"id": "cust_002", "name": "Globex Inc", "email": "info@globex.com", "status": "healthy", "plan": "pro", "mrr": 1200, "since": "2023-01-10"},
        "initech": {"id": "cust_003", "name": "Initech LLC", "email": "hello@initech.com", "status": "churned", "plan": "starter", "mrr": 0, "since": "2021-06-01"},
    },
    "orders": {
        "cust_001": [
            {"order_id": "ord_101", "date": "2024-10-01", "amount": 4800, "status": "delivered", "items": ["Enterprise Plan - Oct"]},
            {"order_id": "ord_089", "date": "2024-09-01", "amount": 5000, "status": "delivered", "items": ["Enterprise Plan - Sep"]},
            {"order_id": "ord_076", "date": "2024-08-01", "amount": 5000, "status": "refunded", "items": ["Enterprise Plan - Aug"]},
        ],
        "cust_002": [
            {"order_id": "ord_102", "date": "2024-10-01", "amount": 1200, "status": "delivered", "items": ["Pro Plan - Oct"]},
        ],
    },
    "support_tickets": {
        "cust_001": [
            {"ticket_id": "tkt_051", "subject": "API rate limits too low", "status": "open", "priority": "high", "created": "2024-09-28"},
            {"ticket_id": "tkt_048", "subject": "Data export failing", "status": "resolved", "priority": "medium", "created": "2024-09-15"},
            {"ticket_id": "tkt_042", "subject": "SSO integration issues", "status": "resolved", "priority": "high", "created": "2024-09-01"},
        ],
    },
}


class ToolExecutor:
    def __init__(self, tools: list[ToolConfig]):
        self.tools = {t.name: t for t in tools}

    async def execute(self, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        tool = self.tools.get(tool_name)
        if not tool:
            return {"error": True, "code": "TOOL_NOT_FOUND", "message": f"Tool '{tool_name}' is not registered"}

        if not tool.config.get("mock", False) and tool.endpoint:
            return await self._call_endpoint(tool, tool_input)

        return await self._mock_execute(tool_name, tool_input)

    async def _call_endpoint(self, tool: ToolConfig, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(tool.endpoint, json=tool_input)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": True, "code": "TOOL_ERROR", "message": str(e)}

    async def _mock_execute(self, tool_name: str, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(0.1)

        if tool_name == "get_customer":
            customer_id = tool_input.get("customer_id", "").lower()
            for key, customer in MOCK_DATA["customers"].items():
                if key in customer_id or customer_id in customer["name"].lower():
                    tickets = MOCK_DATA["support_tickets"].get(customer["id"], [])
                    return {
                        **customer,
                        "open_tickets": len([t for t in tickets if t["status"] == "open"]),
                        "total_tickets_last_30_days": len([t for t in tickets]),
                    }
            return {"error": True, "code": "CUSTOMER_NOT_FOUND", "message": f"Customer '{customer_id}' not found"}

        elif tool_name == "get_orders":
            customer_id = tool_input.get("customer_id", "")
            orders = MOCK_DATA["orders"].get(customer_id, [])
            limit = tool_input.get("limit", 10)
            return {"orders": orders[:limit], "total": len(orders)}

        elif tool_name == "search_knowledge_base":
            query = tool_input.get("query", "").lower()
            results = []
            if "refund" in query or "return" in query:
                results = [
                    {"content": "Refund Policy: Customers may request a refund within 30 days of purchase. Enterprise customers have a 60-day refund window. To process a refund, the customer must submit a ticket with order details.", "source": "Refund Policy", "page": 3, "score": 0.95},
                    {"content": "Partial refunds are available for annual plans if cancelled within the first 6 months. Monthly plans are non-refundable after the billing period starts.", "source": "Refund Policy", "page": 4, "score": 0.87},
                ]
            elif "churn" in query or "risk" in query or "at risk" in query:
                results = [
                    {"content": "Churn Indicators: Customers showing 3+ support tickets in 30 days, >20% decrease in usage, or missed renewal discussions are classified as 'at_risk'. Immediate action required: schedule account review.", "source": "Customer Success Playbook", "page": 12, "score": 0.92},
                    {"content": "At-risk accounts should be escalated to Customer Success Managers within 24 hours. Recommended actions: executive outreach, technical review, and custom retention offer.", "source": "Escalation Procedures", "page": 2, "score": 0.88},
                ]
            elif "escalat" in query:
                results = [
                    {"content": "Escalation Procedure: P1 issues must be escalated within 1 hour. Contact on-call engineer via PagerDuty. P2 issues within 4 hours. Always notify the account manager.", "source": "Escalation Procedures", "page": 1, "score": 0.94},
                ]
            else:
                results = [
                    {"content": "General support policy: All support tickets are acknowledged within 2 business hours. Resolution SLA depends on priority level.", "source": "Support Guidelines", "page": 1, "score": 0.75},
                ]
            return {"results": results[:tool_input.get("top_k", 5)]}

        elif tool_name == "create_support_ticket":
            return {
                "ticket_id": f"tkt_{hash(str(tool_input)) % 10000:04d}",
                "status": "created",
                "message": f"Support ticket created: {tool_input.get('subject')}",
                "priority": tool_input.get("priority", "medium"),
            }

        elif tool_name == "send_email":
            return {
                "message_id": f"msg_{hash(str(tool_input)) % 10000:04d}",
                "status": "sent",
                "to": tool_input.get("to"),
            }

        return {"error": True, "code": "UNKNOWN_TOOL", "message": f"Unknown tool: {tool_name}"}
