'use client'

import { useState } from 'react'
import { Bell, X, Calendar, User, Clock } from 'lucide-react'
import { useNotificationContext } from '@admin/context/notification-context'
import { format } from 'date-fns'
import Link from 'next/link'

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll, removeNotification } = useNotificationContext()
  const [showDropdown, setShowDropdown] = useState(false)

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
    if (!showDropdown) {
      markAllRead()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative h-9 w-9 rounded-full border border-[#f2f2f2] bg-[#fafafa] flex items-center justify-center hover:bg-slate-50 transition-colors focus:outline-none"
      >
        <Bell className="w-4 h-4 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-[#f2f2f2] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#f2f2f2] flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="relative group border-b border-[#f8f9fa] last:border-0">
                    <Link
                      href="/admin/appointments"
                      onClick={() => setShowDropdown(false)}
                      className="block p-4 pr-10 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">New Appointment!</p>
                          <div className="mt-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-700 truncate">{notif.clientName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{notif.date} at {notif.time}</span>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[10px] text-slate-400">
                            {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        removeNotification(notif.id)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                      title="Remove notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href="/admin/appointments"
              onClick={() => setShowDropdown(false)}
              className="block p-3 text-center text-[12px] font-semibold text-blue-600 hover:bg-blue-50 border-t border-[#f2f2f2]"
            >
              View all appointments
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
