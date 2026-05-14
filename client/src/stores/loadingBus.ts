type LoadingSnapshot = {
  pendingRequests: number
}

let pendingRequests = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeLoading(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLoadingSnapshot(): LoadingSnapshot {
  return { pendingRequests }
}

export function beginGlobalLoading() {
  pendingRequests += 1
  emit()
}

export function endGlobalLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1)
  emit()
}
