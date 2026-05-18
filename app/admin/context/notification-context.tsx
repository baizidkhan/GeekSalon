'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { getAppointments } from '@admin/api/appointments/appointments'

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
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  clearAll: () => {},
  removeNotification: () => {},
})

export function useNotificationContext() {
  return useContext(NotificationContext)
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NewAppointmentPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // 1. Load notifications & unreadCount from localStorage on mount (hydration-safe)
  useEffect(() => {
    setIsMounted(true)
    const savedNotifs = localStorage.getItem('admin_notifications')
    const savedCount = localStorage.getItem('admin_unread_count')
    let loadedNotifs: NewAppointmentPayload[] = []

    if (savedNotifs) {
      try {
        loadedNotifs = JSON.parse(savedNotifs)
        setNotifications(loadedNotifs)
      } catch (e) {
        console.error('Failed to parse notifications from localStorage:', e)
      }
    }
    if (savedCount) {
      setUnreadCount(parseInt(savedCount, 10) || 0)
    }

    // Fetch any bookings that occurred while the admin was away
    const fetchLatestBookings = async () => {
      try {
        const data = await getAppointments({ page: 1, limit: 50 })
        const appointmentsList = data?.data || data || []
        if (Array.isArray(appointmentsList)) {
          setNotifications((prev) => {
            const currentList = prev.length > 0 ? prev : loadedNotifs
            const newestDate = currentList.length > 0 
              ? new Date(currentList[0].createdAt).getTime() 
              : 0

            let newCount = 0
            const merged = [...currentList]
            
            appointmentsList.forEach((apt: any) => {
              const formatted: NewAppointmentPayload = {
                id: apt.id,
                clientName: apt.client?.name ?? apt.clientName,
                phoneNumber: apt.phoneNumber,
                date: apt.date,
                time: apt.time,
                services: apt.services || [],
                status: apt.status,
                createdAt: apt.createdAt,
              }
              
              if (!merged.some((n) => n.id === formatted.id)) {
                merged.push(formatted)
                // If it is newer than our newest existing notification, increment unread count
                if (newestDate > 0 && new Date(formatted.createdAt).getTime() > newestDate) {
                  newCount++
                }
              }
            })
            
            // Sort by createdAt descending
            merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            
            if (newCount > 0) {
              setUnreadCount((c) => c + newCount)
            }
            
            return merged.slice(0, 50)
          })
        }
      } catch (e) {
        console.error('Failed to fetch latest bookings for notifications:', e)
      }
    }

    fetchLatestBookings()
  }, [])

  // 2. Persist notifications to localStorage when changed
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications))
    }
  }, [notifications, isMounted])

  // 3. Persist unreadCount to localStorage when changed
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('admin_unread_count', unreadCount.toString())
    }
  }, [unreadCount, isMounted])

  // 4. Initialize WebSocket socket connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Notification] WS connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      if (err.message !== 'websocket error') {
        console.error('[Notification] WS connection error:', err.message)
      }
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Notification] WS disconnected:', reason)
    })

    socket.on('new-appointment', (data: NewAppointmentPayload) => {
      console.log('[Notification] New appointment received:', data)
      setNotifications((prev) => {
        // Prevent duplicate notification entries just in case
        if (prev.some((n) => n.id === data.id)) return prev
        const updated = [data, ...prev].slice(0, 50) // Store up to 50 notifications
        return updated
      })
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

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}
