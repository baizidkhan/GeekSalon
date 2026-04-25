"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Building2, Clock, CreditCard, Loader2 } from "lucide-react"
import { getBusinessInfo, updateBusinessInfo, getAppointmentSettings, updateAppointmentSettings, getInvoiceSettings, updateInvoiceSettings, type BusinessInfo, type AppointmentSetting, type InvoiceSetting } from "@admin/api/settings/settings"
import { toast } from "sonner"
import { useBusinessName } from "@admin/context/business-context"

const HOUR_DIAL_LABELS = ["12", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]
const ANALOG_TICKS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]

function normalizeTimeWithSeconds(value: string) {
  if (!value) return ""
  const parts = value.split(":")
  if (parts.length === 2) return `${value}:00`
  return value
}

function toTimeSeconds(value: string) {
  const [hour = "0", minute = "0", second = "0"] = normalizeTimeWithSeconds(value).split(":")
  const hh = Number.parseInt(hour, 10) || 0
  const mm = Number.parseInt(minute, 10) || 0
  const ss = Number.parseInt(second, 10) || 0
  return hh * 3600 + mm * 60 + ss
}

function parseTimeValue(value: string) {
  const [hour = "", minute = ""] = normalizeTimeWithSeconds(value).split(":")
  return {
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  }
}

function formatTimePickerLabel(value: string) {
  if (!value) return "Select time"
  const { hour, minute } = parseTimeValue(value)
  const hh = Number.parseInt(hour, 10) || 0
  const twelveHour = hh % 12 || 12
  const ampm = hh >= 12 ? "PM" : "AM"
  return `${String(twelveHour).padStart(2, "0")}:${minute} ${ampm}`
}

function isTimeWithinBounds(time: string, minTime?: string, maxTime?: string) {
  const currentSeconds = toTimeSeconds(time)
  if (minTime && currentSeconds < toTimeSeconds(minTime)) return false
  if (maxTime && currentSeconds > toTimeSeconds(maxTime)) return false
  return true
}

function isHourSelectable(hour: string, minTime?: string, maxTime?: string) {
  if (!minTime && !maxTime) return true
  const earliestMinute = `${hour}:00:00`
  const latestMinute = `${hour}:59:59`
  if (minTime && toTimeSeconds(latestMinute) < toTimeSeconds(minTime)) return false
  if (maxTime && toTimeSeconds(earliestMinute) > toTimeSeconds(maxTime)) return false
  return true
}

function getDialLabelFromHour(hour: string) {
  const parsedHour = Number.parseInt(hour, 10)
  if (Number.isNaN(parsedHour)) return null
  const twelveHour = parsedHour % 12 || 12
  return String(twelveHour).padStart(2, "0")
}

function buildDialHourMap(minTime?: string, maxTime?: string) {
  const result: Record<string, string | undefined> = {
    "12": undefined,
    "01": undefined,
    "02": undefined,
    "03": undefined,
    "04": undefined,
    "05": undefined,
    "06": undefined,
    "07": undefined,
    "08": undefined,
    "09": undefined,
    "10": undefined,
    "11": undefined,
  }

  for (let h = 0; h < 24; h++) {
    const hour = String(h).padStart(2, "0")
    if (!isHourSelectable(hour, minTime, maxTime)) continue
    const dialLabel = getDialLabelFromHour(hour)
    if (!dialLabel) continue
    if (!result[dialLabel]) {
      result[dialLabel] = hour
    }
  }

  return result
}

function AnalogClockDial({
  values,
  selected,
  onSelect,
  isDisabled,
  title,
}: {
  values: string[]
  selected: string
  onSelect: (value: string) => void
  isDisabled?: (value: string) => boolean
  title: string
}) {
  const center = 128
  const radius = 100
  const selectedIndex = values.indexOf(selected)
  const handRotation = selectedIndex >= 0 ? selectedIndex * 30 : 0

  return (
    <div className="rounded-xl border border-border bg-muted/10 p-4">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="relative mx-auto h-64 w-64 rounded-full border border-border/70 bg-gradient-to-b from-background to-muted/30 shadow-inner">
        <svg className="pointer-events-none absolute inset-0" viewBox="0 0 256 256" aria-hidden="true">
          <line
            x1="128"
            y1="128"
            x2="128"
            y2="42"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/80"
            transform={`rotate(${handRotation} 128 128)`}
          />
        </svg>
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        {values.map((value, index) => {
          const angle = ((index * 30) - 90) * (Math.PI / 180)
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          const disabled = isDisabled?.(value) ?? false
          const active = value === selected

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(value)}
              className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border text-xs font-semibold transition-all ${active
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                } ${disabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              {value}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ClockPickerField({
  value,
  onChange,
  minTime,
  maxTime,
  placeholder = "Select time",
}: {
  value: string
  onChange: (value: string) => void
  minTime?: string
  maxTime?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"hour" | "minute">("hour")
  const [draftHour, setDraftHour] = useState("09")
  const [draftMinute, setDraftMinute] = useState("00")
  const dialHourMap = useMemo(() => buildDialHourMap(minTime, maxTime), [minTime, maxTime])

  useEffect(() => {
    if (!open) return
    const parts = parseTimeValue(value)
    const firstAvailableHour = Object.values(dialHourMap).find((hour) => Boolean(hour)) ?? "09"
    const normalizedHour = Object.values(dialHourMap).includes(parts.hour) ? parts.hour : firstAvailableHour
    setDraftHour(normalizedHour)
    setDraftMinute(parts.minute || "00")
    setStep("hour")
  }, [open, value, dialHourMap])

  const handleHourSelect = (hourLabel: string) => {
    const mappedHour = dialHourMap[hourLabel]
    if (!mappedHour) return
    setDraftHour(mappedHour)
    const parts = parseTimeValue(value)
    setDraftMinute(parts.minute || "00")
    setStep("minute")
  }

  const handleMinuteSelect = (minute: string) => {
    const nextTime = `${draftHour}:${minute}`
    onChange(nextTime)
    setOpen(false)
    setStep("hour")
  }

  const displayLabel = value ? formatTimePickerLabel(value) : placeholder
  const previewLabel = formatTimePickerLabel(`${draftHour}:${draftMinute}:00`)
  const selectedDialLabel = getDialLabelFromHour(draftHour) ?? "09"
  const serviceWindowLabel =
    minTime && maxTime
      ? `${formatTimePickerLabel(minTime)} - ${formatTimePickerLabel(maxTime)}`
      : "Pick hour and minute"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start px-3 font-normal">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{displayLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 shadow-xl overflow-hidden" align="start">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 via-background to-transparent px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.22em] text-primary/70 uppercase">Clock Picker</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{step === "hour" ? "Choose an hour" : "Choose minutes"}</p>
              <p className="text-xs text-muted-foreground">{serviceWindowLabel}</p>
            </div>
          </div>
        </div>
        {step === "hour" ? (
          <div className="p-4">
            <AnalogClockDial
              title="Hours"
              values={HOUR_DIAL_LABELS}
              selected={selectedDialLabel}
              onSelect={handleHourSelect}
              isDisabled={(hourLabel) => {
                const mappedHour = dialHourMap[hourLabel]
                if (!mappedHour) return true
                return !isHourSelectable(mappedHour, minTime, maxTime)
              }}
            />
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setStep("hour")}>Back to hours</Button>
              <div className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                {previewLabel}
              </div>
            </div>
            <AnalogClockDial
              title="Minutes"
              values={ANALOG_TICKS}
              selected={draftMinute}
              onSelect={handleMinuteSelect}
              isDisabled={(minute) => !isTimeWithinBounds(`${draftHour}:${minute}:00`, minTime, maxTime)}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default function SettingsPage() {
  const { refresh: refreshBusinessName } = useBusinessName()
  const [loading, setLoading] = useState(true)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [businessSettings, setBusinessSettings] = useState<BusinessInfo>({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
  })
  const [bookingSettings, setBookingSettings] = useState<AppointmentSetting>({
    openingTime: "",
    closingTime: "",
    defaultSlotDuration: 30,
    advanceBookingWindow: 30,
  })
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSetting>({
    defaultCurrency: "BDT",
    taxRate: 15,
  })

  useEffect(() => {
    async function loadSettings() {
      const [businessResult, appointmentResult, invoiceResult] = await Promise.allSettled([
        getBusinessInfo(),
        getAppointmentSettings(),
        getInvoiceSettings(),
      ])
      if (businessResult.status === 'fulfilled' && businessResult.value) setBusinessSettings(businessResult.value)
      if (appointmentResult.status === 'fulfilled' && appointmentResult.value) setBookingSettings(appointmentResult.value)
      if (invoiceResult.status === 'fulfilled' && invoiceResult.value) setInvoiceSettings(invoiceResult.value)
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSaveBusinessInfo = async () => {
    setSavingBusiness(true)
    try {
      const response = await updateBusinessInfo(businessSettings)
      if (response) {
        setBusinessSettings(response)
      }
      await refreshBusinessName()
      toast.success("Business settings updated successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed to update business settings")
    } finally {
      setSavingBusiness(false)
    }
  }

  const handleSaveBookingSettings = async () => {
    setSavingBooking(true)
    try {
      const response = await updateAppointmentSettings(bookingSettings)
      if (response) {
        setBookingSettings(response)
      }
      toast.success("Booking settings updated successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed to update booking settings")
    } finally {
      setSavingBooking(false)
    }
  }

  const handleSaveInvoiceSettings = async () => {
    setSavingInvoice(true)
    try {
      const response = await updateInvoiceSettings(invoiceSettings)
      if (response) {
        setInvoiceSettings(response)
      }
      toast.success("Billing settings updated successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed to update billing settings")
    } finally {
      setSavingInvoice(false)
    }
  }

  return (
    <div className="premium-page p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Configuration</p>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your salon preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Booking</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Business Information</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={businessSettings.businessName || ""}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, businessName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={businessSettings.email || ""}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={businessSettings.phone || ""}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Business Address</Label>
                <Textarea
                  value={businessSettings.address || ""}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, address: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input
                  value={businessSettings.gstNumber || ""}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, gstNumber: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveBusinessInfo} disabled={savingBusiness}>
                {savingBusiness && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="booking">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Booking Settings</h3>
            <div className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Opening Time</Label>
                  <ClockPickerField
                    value={bookingSettings.openingTime || ""}
                    maxTime={bookingSettings.closingTime || undefined}
                    onChange={(nextTime) =>
                      setBookingSettings({ ...bookingSettings, openingTime: nextTime })
                    }
                  />
                </div>
                <div>
                  <Label>Closing Time</Label>
                  <ClockPickerField
                    value={bookingSettings.closingTime || ""}
                    minTime={bookingSettings.openingTime || undefined}
                    onChange={(nextTime) =>
                      setBookingSettings({ ...bookingSettings, closingTime: nextTime })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Default Slot Duration</Label>
                <Select
                  value={String(bookingSettings.defaultSlotDuration)}
                  disabled
                  onValueChange={(value) =>
                    setBookingSettings({ ...bookingSettings, defaultSlotDuration: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Advance Booking Window (Days)</Label>
                <Input
                  type="number"
                  value={bookingSettings.advanceBookingWindow || 0}
                  disabled
                  onChange={(e) =>
                    setBookingSettings({ ...bookingSettings, advanceBookingWindow: Number(e.target.value) })
                  }
                />
              </div>
              <Button onClick={handleSaveBookingSettings} disabled={savingBooking}>
                {savingBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Billing & Payment Settings</h3>
            <div className="space-y-4 max-w-xl">
              <div>
                <Label>Default Currency</Label>
                <Select
                  value={invoiceSettings.defaultCurrency || "BDT"}
                  onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, defaultCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">Bangladeshi Taka (BDT ৳)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD $)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR €)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP £)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Currency symbol: {invoiceSettings.defaultCurrency === 'BDT' ? '৳' : invoiceSettings.defaultCurrency === 'USD' ? '$' : invoiceSettings.defaultCurrency === 'EUR' ? '€' : invoiceSettings.defaultCurrency === 'GBP' ? '£' : ''} ({invoiceSettings.defaultCurrency})</p>
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={invoiceSettings.taxRate || 0}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxRate: Number(e.target.value) })}
                />
              </div>
              <Button onClick={handleSaveInvoiceSettings} disabled={savingInvoice}>
                {savingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
