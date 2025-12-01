export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf'
];

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

export const SAFETY_RATINGS = {
  GREEN: 'green',
  YELLOW: 'yellow', 
  RED: 'red'
};

export const SCAN_TYPES = {
  IMAGE: 'image',
  MENU: 'menu',
  QR: 'qr'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};