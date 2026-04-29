import api from '../base'
import { CACHE, consumeStale, markStale } from '@admin/lib/cache'

const TTL = 24 * 60 * 60 * 1000 // 24 hours — settings change very rarely

export interface BusinessInfo {
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface InvoiceSetting {
  defaultCurrency?: string;
  taxRate?: number;
}

export interface AppointmentSetting {
  openingTime?: string;
  closingTime?: string;
  defaultSlotDuration?: number;
  advanceBookingWindow?: number;
}

// Business Info
export async function getBusinessInfo(): Promise<BusinessInfo> {
  const { data } = await api.get('/bussiness-info', { cache: false })
  return data
}

export async function updateBusinessInfo(businessData: BusinessInfo) {
  const { businessName, email, phone, address, gstNumber } = businessData
  const { data } = await api.patch('/bussiness-info', { businessName, email, phone, address, gstNumber })
  markStale(CACHE.BUSINESS_INFO, CACHE.DASHBOARD)
  return data
}

// Invoice Settings
export async function getInvoiceSettings(): Promise<InvoiceSetting> {
  const { data } = await api.get('/invoice-setting', { cache: false })
  return data
}

export async function updateInvoiceSettings(invoiceData: InvoiceSetting) {
  const { defaultCurrency, taxRate } = invoiceData
  const { data } = await api.patch('/invoice-setting', { defaultCurrency, taxRate })
  markStale(CACHE.INVOICE_SETTING, CACHE.BILLING)
  return data
}

// Appointment Settings
export async function getAppointmentSettings(): Promise<AppointmentSetting> {
  const { data } = await api.get('/appointment-setting', { cache: false })
  return data
}

export async function updateAppointmentSettings(appointmentData: AppointmentSetting) {
  const { openingTime, closingTime, defaultSlotDuration, advanceBookingWindow } = appointmentData
  const { data } = await api.patch('/appointment-setting', { openingTime, closingTime, defaultSlotDuration, advanceBookingWindow })
  markStale(CACHE.APPOINTMENT_SETTING, CACHE.APPOINTMENTS)
  return data
}

// Why Choose Us Images
export async function getWhyChooseUsImages() {
  const { data } = await api.get('/why-choose-us-image', { cache: false })
  return data
}

export async function updateWhyChooseUsImages(formData: FormData) {
  const { data } = await api.patch('/why-choose-us-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
