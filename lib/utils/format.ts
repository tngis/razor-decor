// Format price in Mongolian Tugrik
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove country code if present
  const cleaned = phone.replace('+976', '');

  // Format as XXXX-XXXX
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }

  return phone;
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Format date and time
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
