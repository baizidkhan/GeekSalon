import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(image?: string | null) {
  if (!image) return undefined;
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}/uploads/${image}`;
}
