'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface NewDeviceUserPayload {
  id: string
  device_uid: string
  name: string | null
}

export interface AttendanceUpdatedPayload {
  refreshedAt: string
  attendanceDates: string[]
  deviceUserIds: string[]
}

interface SocketHandlers {
  onNewDeviceUser?: (payload: NewDeviceUserPayload) => void
  onAttendanceUpdated?: (payload: AttendanceUpdatedPayload) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function useBiometricSocket(handlers: SocketHandlers) {
  const socketRef = useRef<Socket | null>(null)
  const handlerRef = useRef<SocketHandlers>(handlers)

  useEffect(() => {
    handlerRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Biometric] WS connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Biometric] WS disconnected:', reason)
    })

    socket.on('new-device-user', (payload: NewDeviceUserPayload) => {
      handlerRef.current.onNewDeviceUser?.(payload)
    })

    socket.on('attendance-updated', (payload: AttendanceUpdatedPayload) => {
      handlerRef.current.onAttendanceUpdated?.(payload)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, []) // connect once on mount

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  return { disconnect }
}
