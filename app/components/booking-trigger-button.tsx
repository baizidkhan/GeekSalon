"use client"

import { useBooking } from "@/context/BookingContext"
import React from "react"

interface BookingTriggerButtonProps {
  className?: string
  children: React.ReactNode
}

export function BookingTriggerButton({ className, children }: BookingTriggerButtonProps) {
  const { openBooking } = useBooking()

  return (
    <button onClick={() => openBooking()} className={className}>
      {children}
    </button>
  )
}
