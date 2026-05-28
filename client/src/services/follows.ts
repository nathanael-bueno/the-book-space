const FOLLOWED_USERS_KEY = 'book-space.followed-users'

function normalizeIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)))
}

function readIds() {
  try {
    const raw = localStorage.getItem(FOLLOWED_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return normalizeIds(parsed.map((id) => String(id)))
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  const normalized = normalizeIds(ids)
  localStorage.setItem(FOLLOWED_USERS_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new Event('book-space:followed-users-changed'))
}

export function listFollowedUserIds() {
  return readIds()
}

export function isFollowingUser(userId: string) {
  return readIds().includes(userId)
}

export function toggleFollowUser(userId: string) {
  const ids = readIds()
  if (ids.includes(userId)) {
    writeIds(ids.filter((id) => id !== userId))
    return false
  }

  writeIds([...ids, userId])
  return true
}
