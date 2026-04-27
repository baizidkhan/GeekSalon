'use client'

import { useCallback, useRef, useState } from 'react'
import { useBiometricSocket, NewDeviceUserPayload } from '@/hooks/use-biometric-socket'
import { BiometricModal } from './biometric-modal'

/**
 * BiometricProvider
 *
 * Connects to the backend WebSocket and queues incoming `new-device-user`
 * events. It shows one modal at a time; after the admin closes/confirms,
 * the next queued user (if any) is shown automatically.
 *
 * Mount this once inside the admin layout so it's always active.
 */
export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<NewDeviceUserPayload | null>(null)
  const queue = useRef<NewDeviceUserPayload[]>([])

  const handleNewUser = useCallback((payload: NewDeviceUserPayload) => {
    setCurrent((prev) => {
      if (prev === null) {
        // Nothing showing — display immediately
        return payload
      }
      // Already showing — enqueue
      queue.current.push(payload)
      return prev
    })
  }, [])

  const handleClose = useCallback(() => {
    setCurrent(() => {
      // Dequeue next if any
      return queue.current.shift() ?? null
    })
  }, [])

  useBiometricSocket(handleNewUser)

  return (
    <>
      {children}
      <BiometricModal payload={current} onClose={handleClose} />
    </>
  )
}
