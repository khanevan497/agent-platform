export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const stored = localStorage.getItem('user')
  if (stored) return JSON.parse(stored)
  return null
}

export function setAuth(token: string, user: any) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isAuthenticated() {
  return !!getToken()
}
