'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

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

interface NotificationHandlers {
  onNewAppointment?: (payload: NewAppointmentPayload) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function useNotification(handlers: NotificationHandlers) {
  const handlerRef = useRef<NotificationHandlers>(handlers)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    handlerRef.current = handlers
  }, [handlers])

  useEffect(() => {
    // Connect to the root namespace — same as BiometricGateway which we know works
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
      handlerRef.current.onNewAppointment?.(data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])
}
