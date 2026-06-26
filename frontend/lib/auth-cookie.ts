/**
 * Gestion du cookie d'auth pour le middleware Next.js
 */

export function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return
  // Cookie httpOnly pas possible côté client — on utilise un cookie js-accessible
  // Le middleware le lit pour la protection des routes
  const maxAge = 3600 // 1h comme le JWT
  document.cookie = `syntax-access-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'syntax-access-token=; path=/; max-age=0'
}
