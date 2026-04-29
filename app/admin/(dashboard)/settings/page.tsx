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
import { Building2, Clock, CreditCard, Loader2, Image as ImageIcon, Plus, X, Upload } from "lucide-react"
import { ClockPickerField } from "@/components/ui/clock-picker"
import { getBusinessInfo, updateBusinessInfo, getAppointmentSettings, updateAppointmentSettings, getInvoiceSettings, updateInvoiceSettings, getWhyChooseUsImages, updateWhyChooseUsImages, type BusinessInfo, type AppointmentSetting, type InvoiceSetting } from "@admin/api/settings/settings"
import { toast } from "sonner"
import { useBusiness } from "@/context/BusinessContext"

export default function SettingsPage() {
  const { refresh: refreshBusinessName } = useBusiness()
  const [loading, setLoading] = useState(true)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [savingWhyChooseUs, setSavingWhyChooseUs] = useState(false)
  const [whyChooseUsData, setWhyChooseUsData] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null, null])
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null])
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
      const [businessResult, appointmentResult, invoiceResult, whyChooseUsResult] = await Promise.allSettled([
        getBusinessInfo(),
        getAppointmentSettings(),
        getInvoiceSettings(),
        getWhyChooseUsImages(),
      ])
      if (businessResult.status === 'fulfilled' && businessResult.value) setBusinessSettings(businessResult.value)
      if (appointmentResult.status === 'fulfilled' && appointmentResult.value) setBookingSettings(appointmentResult.value)
      if (invoiceResult.status === 'fulfilled' && invoiceResult.value) setInvoiceSettings(invoiceResult.value)
      if (whyChooseUsResult.status === 'fulfilled' && whyChooseUsResult.value) {
        setWhyChooseUsData(whyChooseUsResult.value)
        setPreviews([
          whyChooseUsResult.value.image1 || null,
          whyChooseUsResult.value.image2 || null,
          whyChooseUsResult.value.image3 || null,
          whyChooseUsResult.value.image4 || null,
        ])
      }
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

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newFiles = [...selectedFiles]
      newFiles[index] = file
      setSelectedFiles(newFiles)

      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...previews]
        newPreviews[index] = reader.result as string
        setPreviews(newPreviews)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePreview = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles[index] = null
    setSelectedFiles(newFiles)

    const newPreviews = [...previews]
    newPreviews[index] = whyChooseUsData?.[`image${index + 1}`] || null
    setPreviews(newPreviews)
  }

  const handleSaveWhyChooseUs = async () => {
    const hasFiles = selectedFiles.some(f => f !== null)
    if (!hasFiles) {
      toast.info("No changes to save")
      return
    }

    setSavingWhyChooseUs(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file, index) => {
        if (file) {
          // Append with specific field name expected by backend
          formData.append(`image${index + 1}`, file)
        }
      })
      
      const response = await updateWhyChooseUsImages(formData)
      if (response) {
        setWhyChooseUsData(response)
        setPreviews([
          response.image1 || null,
          response.image2 || null,
          response.image3 || null,
          response.image4 || null,
        ])
        setSelectedFiles([null, null, null, null])
      }
      toast.success("Images updated successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed to update images")
    } finally {
      setSavingWhyChooseUs(false)
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
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4">
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
          <TabsTrigger value="whychooseus" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Why Us</span>
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

        <TabsContent value="whychooseus">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium text-foreground">Why Choose Us Images</h3>
                <p className="text-sm text-muted-foreground">Upload up to 4 images for your signature experience section</p>
              </div>
              <Button onClick={handleSaveWhyChooseUs} disabled={savingWhyChooseUs || !selectedFiles.some(f => f !== null)}>
                {savingWhyChooseUs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image {index + 1}</Label>
                    {selectedFiles[index] && (
                      <button onClick={() => handleRemovePreview(index)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="relative group aspect-[4/5] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-400/50 hover:bg-blue-50/30">
                    {previews[index] ? (
                      <>
                        <img src={previews[index]!} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform translate-y-2 group-hover:translate-y-0">
                            Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(index, e)} />
                          </label>
                        </div>
                        {selectedFiles[index] && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            NEW
                          </div>
                        )}
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-1">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Add Image</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG or WEBP</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(index, e)} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">!</div>
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Note on Indices:</p>
                <p className="opacity-90">Images are updated based on their position. To update a specific slot, ensure you upload the image to the correct card above.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
