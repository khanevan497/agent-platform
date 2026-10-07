import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
}

export const agentsApi = {
  list: () => api.get('/agents').then(r => r.data),
  get: (id: string) => api.get(`/agents/${id}`).then(r => r.data),
  create: (data: any) => api.post('/agents', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/agents/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/agents/${id}`).then(r => r.data),
  getTools: (id: string) => api.get(`/agents/${id}/tools`).then(r => r.data),
  setTools: (id: string, toolIds: string[]) => api.post(`/agents/${id}/tools`, { toolIds }).then(r => r.data),
}

export const toolsApi = {
  list: () => api.get('/tools').then(r => r.data),
  get: (id: string) => api.get(`/tools/${id}`).then(r => r.data),
  create: (data: any) => api.post('/tools', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/tools/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/tools/${id}`).then(r => r.data),
}

export const executionsApi = {
  list: (agentId?: string) => api.get('/executions', { params: { agentId } }).then(r => r.data),
  get: (id: string) => api.get(`/executions/${id}`).then(r => r.data),
  create: (agentId: string, input: string) => api.post('/executions', { agentId, input }).then(r => r.data),
  cancel: (id: string) => api.post(`/executions/${id}/cancel`).then(r => r.data),
  metrics: () => api.get('/executions/metrics').then(r => r.data),
}

export const knowledgeApi = {
  listBases: () => api.get('/knowledge-bases').then(r => r.data),
  getBase: (id: string) => api.get(`/knowledge-bases/${id}`).then(r => r.data),
  createBase: (data: any) => api.post('/knowledge-bases', data).then(r => r.data),
  deleteBase: (id: string) => api.delete(`/knowledge-bases/${id}`).then(r => r.data),
  listDocuments: (id: string) => api.get(`/knowledge-bases/${id}/documents`).then(r => r.data),
  addDocument: (id: string, data: any) => api.post(`/knowledge-bases/${id}/documents`, data).then(r => r.data),
}

export const approvalsApi = {
  list: () => api.get('/approvals').then(r => r.data),
  approve: (id: string, notes?: string) => api.post(`/approvals/${id}/approve`, { notes }).then(r => r.data),
  reject: (id: string, notes?: string) => api.post(`/approvals/${id}/reject`, { notes }).then(r => r.data),
}

export const evaluationsApi = {
  listDatasets: () => api.get('/evaluations/datasets').then(r => r.data),
  createDataset: (data: any) => api.post('/evaluations/datasets', data).then(r => r.data),
  listResults: () => api.get('/evaluations/results').then(r => r.data),
  runEval: (agentId: string, datasetId: string) => api.post('/evaluations/run', { agentId, datasetId }).then(r => r.data),
}
