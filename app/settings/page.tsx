"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Bell, Clock, Shield, CreditCard, Globe } from "lucide-react"

export default function SettingsPage() {
  const [businessSettings, setBusinessSettings] = useState({
    name: "SalonBOS",
    email: "contact@salonbos.com",
    phone: "+880 1711-000000",
    address: "123 Dhanmondi Road, Dhaka-1205, Bangladesh",
    gst: "BIN-000000000-0101",
  })

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    smsReminders: true,
    lowStock: true,
    dailyReport: false,
    weeklyReport: true,
  })

  const [bookingSettings, setBookingSettings] = useState({
    openTime: "09:00",
    closeTime: "21:00",
    slotDuration: "30",
    advanceBookingDays: "30",
    cancellationHours: "4",
  })

  return (
    <DashboardLayout>
      <div className="premium-page p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Configuration</p>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your salon preferences</p>
        </div>

        <Tabs defaultValue="business" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Booking</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium text-foreground mb-4">Business Information</h3>
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={businessSettings.name}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={businessSettings.phone}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Business Address</Label>
                  <Textarea
                    value={businessSettings.address}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, address: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label>GST Number</Label>
                  <Input
                    value={businessSettings.gst}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, gst: e.target.value })
                    }
                  />
                </div>
                <Button>Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Appointment Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email when appointments are booked or cancelled
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailAppointments}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailAppointments: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Send SMS reminders to clients before appointments
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when inventory items are running low
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, lowStock: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive daily summary reports via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, dailyReport: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly summary reports via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyReport: checked })
                    }
                  />
                </div>
                <Button>Save Preferences</Button>
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
                    <Input
                      type="time"
                      value={bookingSettings.openTime}
                      onChange={(e) =>
                        setBookingSettings({ ...bookingSettings, openTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Closing Time</Label>
                    <Input
                      type="time"
                      value={bookingSettings.closeTime}
                      onChange={(e) =>
                        setBookingSettings({ ...bookingSettings, closeTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Default Slot Duration</Label>
                  <Select
                    value={bookingSettings.slotDuration}
                    onValueChange={(value) =>
                      setBookingSettings({ ...bookingSettings, slotDuration: value })
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
                    value={bookingSettings.advanceBookingDays}
                    onChange={(e) =>
                      setBookingSettings({ ...bookingSettings, advanceBookingDays: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Cancellation Policy (Hours before appointment)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) =>
                      setBookingSettings({ ...bookingSettings, cancellationHours: e.target.value })
                    }
                  />
                </div>
                <Button>Save Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium text-foreground mb-4">Billing & Payment Settings</h3>
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue="BDT">
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
                  <p className="text-xs text-muted-foreground mt-1">Currency symbol: ৳ (BDT)</p>
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include Tax in Prices</p>
                    <p className="text-sm text-muted-foreground">
                      Display prices with tax included
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Accept Online Payments</p>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to pay online when booking
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <h4 className="font-medium pt-4">Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Cash</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Card</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UPI</span>
                    <Switch defaultChecked />
                  </div>
                </div>
                <Button>Save Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-medium text-foreground mb-4">Security Settings</h3>
              <div className="space-y-6 max-w-xl">
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h4 className="font-medium mb-4">Session Management</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Logout</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically logout after inactivity
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
