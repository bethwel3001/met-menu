export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateBase64Image = (base64String) => {
  if (!base64String) return false;
  
  try {
    // Check if it's a data URL
    if (!base64String.startsWith('data:image/')) return false;
    
    // Extract the base64 part
    const base64Data = base64String.split(',')[1];
    if (!base64Data) return false;
    
    // Check if it's valid base64
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer.length > 0;
  } catch {
    return false;
  }
};