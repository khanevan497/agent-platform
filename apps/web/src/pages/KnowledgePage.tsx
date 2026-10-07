import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, FileText, Trash2, Loader2, ChevronRight } from 'lucide-react'
import { knowledgeApi } from '../lib/api'
import { formatDate } from '../lib/utils'
import { cn } from '../lib/utils'

function AddDocumentModal({ kbId, onClose }: { kbId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', content: '', documentType: 'txt' })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => knowledgeApi.addDocument(kbId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs', kbId] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Add Document</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Refund Policy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.documentType}
                onChange={e => setForm({ ...form, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="txt">TXT</option>
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              placeholder="Paste document content here..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => mutate(form)}
            disabled={!form.title || !form.content || isPending}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Add Document
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KnowledgePage() {
  const queryClient = useQueryClient()
  const [selectedKb, setSelectedKb] = useState<any>(null)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [showCreateKb, setShowCreateKb] = useState(false)
  const [newKbName, setNewKbName] = useState('')

  const { data: kbs, isLoading } = useQuery({ queryKey: ['kbs'], queryFn: knowledgeApi.listBases })
  const { data: docs } = useQuery({
    queryKey: ['docs', selectedKb?.id],
    queryFn: () => knowledgeApi.listDocuments(selectedKb.id),
    enabled: !!selectedKb,
  })

  const { mutate: createKb } = useMutation({
    mutationFn: (data: any) => knowledgeApi.createBase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbs'] })
      setShowCreateKb(false)
      setNewKbName('')
    },
  })

  const { mutate: deleteKb } = useMutation({
    mutationFn: (id: string) => knowledgeApi.deleteBase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbs'] })
      setSelectedKb(null)
    },
  })

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      ready: 'text-green-600', processing: 'text-blue-600',
      pending: 'text-yellow-600', failed: 'text-red-600',
    }
    return map[status] || 'text-gray-500'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Bases</h1>
          <p className="text-gray-500 text-sm mt-1">RAG document management</p>
        </div>
        <button
          onClick={() => setShowCreateKb(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" /> New Knowledge Base
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-3">
          {showCreateKb && (
            <div className="bg-white rounded-xl border-2 border-sky-300 p-4">
              <input
                value={newKbName}
                onChange={e => setNewKbName(e.target.value)}
                placeholder="Knowledge base name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => createKb({ name: newKbName })}
                  disabled={!newKbName}
                  className="flex-1 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                >
                  Create
                </button>
                <button onClick={() => setShowCreateKb(false)} className="flex-1 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : (
            (kbs || []).map((kb: any) => (
              <div
                key={kb.id}
                onClick={() => setSelectedKb(kb)}
                className={cn(
                  'bg-white rounded-xl border p-4 cursor-pointer hover:border-sky-300 transition-colors',
                  selectedKb?.id === kb.id ? 'border-sky-500 shadow-sm' : 'border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span className="font-medium text-sm text-gray-900">{kb.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                {kb.description && <p className="text-xs text-gray-500 mt-1 ml-6">{kb.description}</p>}
                <p className="text-xs text-gray-400 mt-2 ml-6">{formatDate(kb.createdAt)}</p>
              </div>
            ))
          )}
          {!kbs?.length && !isLoading && (
            <div className="text-center py-8 text-gray-400 text-sm">No knowledge bases</div>
          )}
        </div>

        <div className="col-span-2">
          {selectedKb ? (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedKb.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{docs?.length || 0} documents</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddDoc(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100"
                  >
                    <Plus className="w-3 h-3" /> Add Document
                  </button>
                  <button
                    onClick={() => confirm('Delete this knowledge base?') && deleteKb(selectedKb.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {(docs || []).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-400">{doc.documentType} · {formatDate(doc.createdAt)}</p>
                      </div>
                    </div>
                    <span className={cn('text-xs font-medium capitalize', statusColor(doc.status))}>{doc.status}</span>
                  </div>
                ))}
                {!docs?.length && (
                  <div className="text-center py-12 text-gray-400 text-sm">No documents. Add one to get started.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Select a knowledge base to view documents
            </div>
          )}
        </div>
      </div>

      {showAddDoc && selectedKb && (
        <AddDocumentModal kbId={selectedKb.id} onClose={() => setShowAddDoc(false)} />
      )}
    </div>
  )
}
