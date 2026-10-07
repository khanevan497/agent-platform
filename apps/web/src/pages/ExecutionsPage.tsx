import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Loader2, Play } from 'lucide-react'
import { executionsApi } from '../lib/api'
import { formatDate, formatDuration, formatCost, statusColor } from '../lib/utils'
import { cn } from '../lib/utils'

export default function ExecutionsPage() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsApi.list(),
    refetchInterval: 5000,
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Executions</h1>
        <p className="text-gray-500 text-sm mt-1">Agent execution history and traces</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Input</div>
            <div className="col-span-2">Agent</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Steps</div>
            <div className="col-span-1">Latency</div>
            <div className="col-span-1">Cost</div>
            <div className="col-span-1">Started</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(executions || []).map((exec: any) => (
              <Link
                key={exec.id}
                to={`/executions/${exec.id}`}
                className="grid grid-cols-12 px-5 py-3 hover:bg-gray-50 transition-colors text-sm"
              >
                <div className="col-span-4 truncate text-gray-700 pr-4">{exec.input}</div>
                <div className="col-span-2 truncate text-gray-500 text-xs">{exec.agent?.name || '—'}</div>
                <div className="col-span-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(exec.status))}>
                    {exec.status}
                  </span>
                </div>
                <div className="col-span-1 text-gray-500 text-xs">{exec.stepCount}</div>
                <div className="col-span-1 text-gray-500 text-xs">{exec.durationMs ? formatDuration(exec.durationMs) : '—'}</div>
                <div className="col-span-1 text-gray-500 text-xs">{formatCost(exec.estimatedCost)}</div>
                <div className="col-span-1 text-gray-400 text-xs">{formatDate(exec.startedAt)}</div>
              </Link>
            ))}
            {!executions?.length && (
              <div className="text-center py-16 text-gray-400">
                <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No executions yet. Try the playground on any agent.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
