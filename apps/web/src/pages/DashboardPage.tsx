import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bot, Play, CheckCircle, XCircle, Clock, DollarSign, Zap, ArrowRight } from 'lucide-react'
import { executionsApi, agentsApi } from '../lib/api'
import { formatDate, formatDuration, formatCost, statusColor } from '../lib/utils'
import { cn } from '../lib/utils'

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: metrics } = useQuery({ queryKey: ['metrics'], queryFn: executionsApi.metrics })
  const { data: agents } = useQuery({ queryKey: ['agents'], queryFn: agentsApi.list })
  const { data: executions } = useQuery({ queryKey: ['executions'], queryFn: () => executionsApi.list() })

  const recentExecutions = (executions || []).slice(0, 5)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Agent platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Executions" value={metrics?.total ?? '—'} icon={Play} color="bg-sky-500" />
        <StatCard title="Success Rate" value={metrics ? `${metrics.successRate}%` : '—'} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Avg Latency" value={metrics ? formatDuration(metrics.avgLatency) : '—'} icon={Clock} color="bg-purple-500" />
        <StatCard title="Total Cost" value={metrics ? formatCost(metrics.totalCost) : '—'} icon={DollarSign} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-600" /> Agents
            </h2>
            <Link to="/agents" className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(agents || []).map((agent: any) => (
              <div key={agent.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-sm text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{agent.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(agent.status))}>
                    {agent.status}
                  </span>
                  <Link to={`/agents/${agent.id}/playground`} className="text-sky-600 hover:text-sky-700">
                    <Zap className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {!(agents?.length) && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No agents yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-600" /> Recent Executions
            </h2>
            <Link to="/executions" className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentExecutions.map((exec: any) => (
              <Link key={exec.id} to={`/executions/${exec.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm text-gray-700 truncate max-w-xs">{exec.input}</p>
                  <p className="text-xs text-gray-400">{formatDate(exec.startedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(exec.status))}>
                    {exec.status}
                  </span>
                  {exec.durationMs && (
                    <span className="text-xs text-gray-400">{formatDuration(exec.durationMs)}</span>
                  )}
                </div>
              </Link>
            ))}
            {!recentExecutions.length && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No executions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
