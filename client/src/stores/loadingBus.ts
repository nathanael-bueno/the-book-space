type LoadingSnapshot = {
  pendingRequests: number
}

let pendingRequests = 0
let snapshot: LoadingSnapshot = { pendingRequests: 0 }
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeLoading(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLoadingSnapshot(): LoadingSnapshot {
  return snapshot
}

export function beginGlobalLoading() {
  pendingRequests += 1
  snapshot = { pendingRequests }
  emit()
}

export function endGlobalLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1)
  snapshot = { pendingRequests }
  emit()
}
