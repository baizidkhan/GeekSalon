"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Service } from '@/lib/types'

interface BookingContextType {
    isOpen: boolean
    selectedService: Service | null
    openBooking: (service?: Service) => void
    closeBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)

    const openBooking = (service?: Service) => {
        if (service) {
            setSelectedService(service)
        } else {
            setSelectedService(null)
        }
        setIsOpen(true)
    }

    const closeBooking = () => {
        setIsOpen(false)
        setSelectedService(null)
    }

    return (
        <BookingContext.Provider value={{ isOpen, selectedService, openBooking, closeBooking }}>
            {children}
        </BookingContext.Provider>
    )
}

export function useBooking() {
    const context = useContext(BookingContext)
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider')
    }
    return context
}
