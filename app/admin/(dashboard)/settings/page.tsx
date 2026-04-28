"use client"

import { useState, useEffect } from "react"
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
import { Building2, Clock, CreditCard, Loader2 } from "lucide-react"
import { ClockPickerField } from "@/components/ui/clock-picker"
import { getBusinessInfo, updateBusinessInfo, getAppointmentSettings, updateAppointmentSettings, getInvoiceSettings, updateInvoiceSettings, type BusinessInfo, type AppointmentSetting, type InvoiceSetting } from "@admin/api/settings/settings"
import { toast } from "sonner"
import { useBusiness } from "@/context/BusinessContext"

export default function SettingsPage() {
  const { refresh: refreshBusinessName } = useBusiness()
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
