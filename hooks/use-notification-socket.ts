'use client'

import { useEffect, useRef, useCallback } from 'react'
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

interface SocketHandlers {
  onNewAppointment?: (payload: NewAppointmentPayload) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function useNotificationSocket(handlers: SocketHandlers) {
  const socketRef = useRef<Socket | null>(null)
  const handlerRef = useRef<SocketHandlers>(handlers)

  useEffect(() => {
    handlerRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const socket = io(`${BACKEND_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Notification] WS connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.error('[Notification] WS connection error:', err)
    })

    socket.on('reconnect', (attempt) => {
      console.log('[Notification] WS reconnected after', attempt, 'attempts')
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Notification] WS disconnected:', reason)
    })

    socket.on('new-appointment', (payload: NewAppointmentPayload) => {
      console.log('[Notification] New appointment received:', payload)
      handlerRef.current.onNewAppointment?.(payload)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  return { disconnect }
}
