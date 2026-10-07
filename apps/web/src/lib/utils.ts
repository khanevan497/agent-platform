import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatCost(cost: number) {
  return `$${Number(cost).toFixed(4)}`
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-700',
    max_steps_exceeded: 'bg-orange-100 text-orange-800',
    pending: 'bg-yellow-100 text-yellow-800',
    awaiting_approval: 'bg-purple-100 text-purple-800',
    at_risk: 'bg-red-100 text-red-700',
    healthy: 'bg-green-100 text-green-700',
    churned: 'bg-gray-100 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
