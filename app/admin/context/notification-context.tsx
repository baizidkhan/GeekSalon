'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

export interface NewAppointmentPayload {
  id: string
  clientName: string
  phoneNumber: string
  date: string
  time: string
  services: string[]
  status: string
  createdAt: string
}

interface NotificationContextValue {
  notifications: NewAppointmentPayload[]
  unreadCount: number
  markAllRead: () => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  clearAll: () => {},
})

export function useNotificationContext() {
  return useContext(NotificationContext)
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NewAppointmentPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Notification] WS connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.error('[Notification] WS connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Notification] WS disconnected:', reason)
    })

    socket.on('new-appointment', (data: NewAppointmentPayload) => {
      console.log('[Notification] New appointment received:', data)
      setNotifications((prev) => [data, ...prev].slice(0, 20))
      setUnreadCount((prev) => prev + 1)
      toast.success('📅 New Appointment!', {
        description: `${data.clientName} booked for ${data.date} at ${data.time}`,
        duration: 6000,
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const markAllRead = useCallback(() => setUnreadCount(0), [])
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}
