import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { executionsApi } from '../lib/api'
import { formatDate, formatDuration, formatCost, statusColor } from '../lib/utils'
import { cn } from '../lib/utils'

function TraceEvent({ event }: { event: any }) {
  const [open, setOpen] = useState(false)
  const ts = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false })
  const hasDetail = ['tool_call', 'tool_result'].includes(event.type)

  const colors: Record<string, string> = {
    agent_started: 'bg-green-100 text-green-700',
    llm_call: 'bg-blue-100 text-blue-700',
    tool_call: 'bg-purple-100 text-purple-700',
    tool_result: 'bg-violet-100 text-violet-700',
    completed: 'bg-green-100 text-green-700',
    max_steps_exceeded: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
        <div className="w-0.5 flex-1 bg-gray-100 mt-1" />
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{ts}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors[event.type] || 'bg-gray-100 text-gray-600')}>
            {event.type.replace(/_/g, ' ')}
          </span>
          {event.data?.tool && <span className="text-xs font-mono text-gray-600">{event.data.tool}</span>}
          {hasDetail && (
            <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600">
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
        {open && (
          <pre className="mt-2 text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-600 border border-gray-100">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export default function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: exec, isLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionsApi.get(id!),
    refetchInterval: (data) =>
      data && ['completed', 'failed', 'cancelled', 'max_steps_exceeded'].includes(data.status) ? false : 3000,
  })

  if (isLoading || !exec) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/executions" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Execution Detail</h1>
          <p className="text-sm text-gray-400 font-mono">{exec.id}</p>
        </div>
        <span className={cn('ml-auto text-sm px-3 py-1 rounded-full font-medium', statusColor(exec.status))}>
          {exec.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Agent', value: exec.agent?.name || '—' },
          { label: 'Duration', value: exec.durationMs ? formatDuration(exec.durationMs) : '—' },
          { label: 'Tokens', value: exec.tokenUsage?.total_tokens || 0 },
          { label: 'Cost', value: formatCost(exec.estimatedCost) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Input</h3>
            <p className="text-sm text-gray-800">{exec.input}</p>
          </div>
          {exec.output && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Output</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{exec.output}</p>
            </div>
          )}
          {exec.error && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
              <h3 className="font-semibold text-sm text-red-700 mb-3">Error</h3>
              <p className="text-sm text-red-800">{exec.error}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">Execution Trace</h3>
          <div>
            {(exec.trace || []).map((event: any, i: number) => (
              <TraceEvent key={i} event={event} />
            ))}
            {!exec.trace?.length && (
              <p className="text-sm text-gray-400">No trace available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
