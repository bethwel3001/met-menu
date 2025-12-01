export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  menu: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const SAFETY_COLORS = {
  green: {
    bg: 'bg-health-green/20',
    border: 'border-health-green',
    text: 'text-health-green'
  },
  yellow: {
    bg: 'bg-health-yellow/20',
    border: 'border-health-yellow',
    text: 'text-health-yellow'
  },
  red: {
    bg: 'bg-health-red/20',
    border: 'border-health-red',
    text: 'text-health-red'
  }
}