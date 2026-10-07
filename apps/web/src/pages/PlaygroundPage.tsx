import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Loader2, Bot, User, Wrench, ChevronDown, ChevronRight, Clock, Coins, DollarSign } from 'lucide-react'
import { agentsApi, executionsApi } from '../lib/api'
import { formatDuration, formatCost, statusColor } from '../lib/utils'
import { cn } from '../lib/utils'

function TraceEvent({ event }: { event: any }) {
  const [open, setOpen] = useState(false)
  const typeConfig: Record<string, { label: string; color: string }> = {
    agent_started: { label: 'Agent started', color: 'text-green-600' },
    llm_call: { label: 'LLM reasoning', color: 'text-blue-600' },
    tool_call: { label: `Tool: ${event.data?.tool}`, color: 'text-purple-600' },
    tool_result: { label: `Result: ${event.data?.tool}`, color: 'text-purple-500' },
    completed: { label: 'Completed', color: 'text-green-600' },
    max_steps_exceeded: { label: 'Max steps exceeded', color: 'text-orange-600' },
    error: { label: 'Error', color: 'text-red-600' },
  }

  const config = typeConfig[event.type] || { label: event.type, color: 'text-gray-600' }
  const ts = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const hasDetail = event.type === 'tool_call' || event.type === 'tool_result'

  return (
    <div className="border-l-2 border-gray-200 pl-3 py-1">
      <div
        className={cn('flex items-center gap-2 text-xs cursor-pointer', hasDetail && 'hover:opacity-80')}
        onClick={() => hasDetail && setOpen(!open)}
      >
        <span className="text-gray-400 font-mono">{ts}</span>
        <span className={cn('font-medium', config.color)}>{config.label}</span>
        {hasDetail && (open ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />)}
      </div>
      {open && hasDetail && (
        <pre className="mt-1 text-xs bg-gray-50 rounded p-2 overflow-x-auto text-gray-600">
          {JSON.stringify(event.data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function PlaygroundPage() {
  const { id } = useParams<{ id: string }>()
  const [input, setInput] = useState('')
  const [pollingId, setPollingId] = useState<string | null>(null)
  const [currentExec, setCurrentExec] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()

  const { data: agent } = useQuery({ queryKey: ['agent', id], queryFn: () => agentsApi.get(id!) })
  const { data: executions } = useQuery({
    queryKey: ['executions', id],
    queryFn: () => executionsApi.list(id),
    refetchInterval: pollingId ? 2000 : false,
  })

  const { mutate: runAgent, isPending: isRunning } = useMutation({
    mutationFn: (userInput: string) => executionsApi.create(id!, userInput),
    onSuccess: (exec) => {
      setPollingId(exec.id)
      setCurrentExec(exec)
      queryClient.invalidateQueries({ queryKey: ['executions', id] })
    },
  })

  useEffect(() => {
    if (!pollingId || !executions) return
    const exec = executions.find((e: any) => e.id === pollingId)
    if (exec) {
      setCurrentExec(exec)
      if (['completed', 'failed', 'cancelled', 'max_steps_exceeded'].includes(exec.status)) {
        setPollingId(null)
      }
    }
  }, [executions, pollingId])

  const handleSubmit = () => {
    if (!input.trim() || isRunning || pollingId) return
    runAgent(input.trim())
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isActive = isRunning || !!pollingId

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/agents/${id}`} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{agent?.name || 'Playground'}</h1>
            <p className="text-xs text-gray-500">{agent?.model} · Max {agent?.maxSteps} steps</p>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Running...</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!currentExec && (
              <div className="text-center py-16 text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Try asking the agent something</p>
                <p className="text-xs mt-1 max-w-sm mx-auto">
                  Example: "Why is Acme Corp at risk of churning?"
                </p>
                <div className="mt-4 space-y-2">
                  {['Why is Acme Corp at risk of churning?', 'What is the refund policy?', 'Find customer Globex and their recent orders'].map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="block mx-auto text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentExec && (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 max-w-prose">
                    {currentExec.input}
                  </div>
                </div>

                {(isActive || currentExec.output) && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      {isActive && !currentExec.output ? (
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Agent is working...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
                          {currentExec.output}
                        </div>
                      )}
                      {currentExec.durationMs && (
                        <div className="flex items-center gap-3 mt-2 px-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(currentExec.durationMs)}</span>
                          <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{currentExec.tokenUsage?.total_tokens || 0} tokens</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCost(currentExec.estimatedCost)}</span>
                          <span className={cn('px-1.5 py-0.5 rounded-full font-medium', statusColor(currentExec.status))}>{currentExec.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-2xl mx-auto flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder="Ask something..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  style={{ maxHeight: '120px' }}
                  disabled={isActive}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isActive}
                className="w-10 h-10 flex items-center justify-center bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Enter to send, Shift+Enter for newline</p>
          </div>
        </div>

        <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Execution Trace</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentExec?.trace?.length > 0 ? (
              currentExec.trace.map((event: any, i: number) => (
                <TraceEvent key={i} event={event} />
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center mt-8">
                {isActive ? 'Trace will appear here...' : 'No trace yet'}
              </div>
            )}
          </div>
          {currentExec && (
            <div className="p-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Steps</span>
                <span className="font-mono">{currentExec.stepCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens</span>
                <span className="font-mono">{currentExec.tokenUsage?.total_tokens || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost</span>
                <span className="font-mono">{formatCost(currentExec.estimatedCost)}</span>
              </div>
              {currentExec.durationMs && (
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className="font-mono">{formatDuration(currentExec.durationMs)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
