import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, Save, Loader2, ArrowLeft, Check, X } from 'lucide-react'
import { agentsApi, toolsApi } from '../lib/api'
import { cn } from '../lib/utils'

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: agent, isLoading } = useQuery({ queryKey: ['agent', id], queryFn: () => agentsApi.get(id!) })
  const { data: allTools } = useQuery({ queryKey: ['tools'], queryFn: toolsApi.list })
  const { data: agentTools } = useQuery({ queryKey: ['agent-tools', id], queryFn: () => agentsApi.getTools(id!) })

  const [form, setForm] = useState<any>(null)
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])

  if (agent && !form) {
    setForm({ ...agent })
    setSelectedToolIds((agentTools || []).map((at: any) => at.toolId))
  }

  if (agentTools && !selectedToolIds.length && agentTools.length > 0 && !form) {
    setSelectedToolIds(agentTools.map((at: any) => at.toolId))
  }

  const { mutate: updateAgent, isPending } = useMutation({
    mutationFn: (data: any) => agentsApi.update(id!, data),
    onSuccess: async (updatedAgent) => {
      await agentsApi.setTools(id!, selectedToolIds)
      queryClient.invalidateQueries({ queryKey: ['agent', id] })
      queryClient.invalidateQueries({ queryKey: ['agent-tools', id] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const toggleTool = (toolId: string) => {
    setSelectedToolIds(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    )
  }

  if (isLoading || !form) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/agents" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{agent?.name}</h1>
          <p className="text-sm text-gray-500">Agent configuration</p>
        </div>
        <Link
          to={`/agents/${id}/playground`}
          className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-100"
        >
          <Zap className="w-4 h-4" /> Open Playground
        </Link>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status || 'draft'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                value={form.systemPrompt || ''}
                onChange={e => setForm({ ...form, systemPrompt: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Model Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={form.model || 'claude-sonnet-4-6'}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                <option value="claude-opus-4-8">Claude Opus 4.8</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="number" step="0.1" min="0" max="1"
                value={form.temperature || 0.7}
                onChange={e => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Steps</label>
              <input
                type="number" min="1" max="50"
                value={form.maxSteps || 8}
                onChange={e => setForm({ ...form, maxSteps: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
              <input
                type="number" min="256" max="32000"
                value={form.maxTokens || 4096}
                onChange={e => setForm({ ...form, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tool Permissions</h2>
          <div className="space-y-2">
            {(allTools || []).map((tool: any) => {
              const enabled = selectedToolIds.includes(tool.id)
              return (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                    enabled ? 'border-sky-300 bg-sky-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs', enabled ? 'text-sky-500' : 'text-gray-400')}>
                        {enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </span>
                      <span className="text-sm font-mono font-medium">{tool.name}</span>
                      {tool.requiresApproval && (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">requires approval</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 ml-5">{tool.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => updateAgent(form)}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
