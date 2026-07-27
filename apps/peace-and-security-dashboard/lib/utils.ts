import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_CONFIG } from './api-config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  // API_CONFIG.BASE_URL is e.g. "http://localhost:5000/api/"
  // Strip trailing "api/" to get the file server base
  const apiBase = API_CONFIG.BASE_URL.replace(/\/api\/?\/?$/, "").replace(/\/$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${apiBase}/${cleanPath}`;
}

