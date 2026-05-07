import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizeAmount(value: number | string | null | undefined) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

export function formatMoney(value: number | string | null | undefined, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(normalizeAmount(value))
}

export function formatCurrency(value: number | string | null | undefined, symbol = '৳') {
  return `${symbol}${formatMoney(value)}`
}

export function getMediaUrl(image?: string | null) {
  if (!image) return undefined;
  if (image.startsWith('http') || image.startsWith('data:') || image.startsWith('blob:')) return image;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}/uploads/${image}`;
}
