'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface NewDeviceUserPayload {
  id: string
  device_uid: string
  name: string | null
}

type Handler = (payload: NewDeviceUserPayload) => void

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function useBiometricSocket(onNewDeviceUser: Handler) {
  const socketRef = useRef<Socket | null>(null)
  const handlerRef = useRef<Handler>(onNewDeviceUser)

  // Keep handler ref up to date without reconnecting
  useEffect(() => {
    handlerRef.current = onNewDeviceUser
  }, [onNewDeviceUser])

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
      handlerRef.current(payload)
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
