import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'
import { getEcho } from '../lib/echo'
import { getCurrentUserId } from '../services/auth'

type NotificationContextValue = {
  unreadCount: number
  incrementUnread: () => void
  resetUnread: () => void
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: PropsWithChildren) {
  const [unreadCount, setUnreadCount] = useState(0)

  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => prev + 1)
  }, [])

  const resetUnread = useCallback(() => {
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) return

    const echo = getEcho()
    const channel = echo
      .private(`notifications.${userId}`)
      .listen('NewUserNotification', () => {
        setUnreadCount((prev) => prev + 1)
      })

    return () => {
      channel.stopListening('NewUserNotification')
    }
  }, [])

  const value = useMemo(
    () => ({ unreadCount, incrementUnread, resetUnread }),
    [unreadCount, incrementUnread, resetUnread]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx)
    throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
