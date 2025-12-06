export function formatPhoneNumber(phone: string, countryCode?: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // US/CA: +1 (415) 555-1234
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Netherlands: +31 20 123 4567
  if (cleaned.startsWith('31')) {
    const rest = cleaned.slice(2);
    if (rest.length >= 9) {
      return `+31 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
    }
  }
  
  // Belgium: +32 2 123 45 67
  if (cleaned.startsWith('32')) {
    const rest = cleaned.slice(2);
    return `+32 ${rest.slice(0, 1)} ${rest.slice(1, 4)} ${rest.slice(4, 6)} ${rest.slice(6)}`;
  }
  
  // Germany: +49 30 12345678
  if (cleaned.startsWith('49')) {
    const rest = cleaned.slice(2);
    return `+49 ${rest.slice(0, 2)} ${rest.slice(2)}`;
  }
  
  // UK: +44 20 1234 5678
  if (cleaned.startsWith('44')) {
    const rest = cleaned.slice(2);
    return `+44 ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`;
  }
  
  // Generic international format
  if (phone.startsWith('+')) {
    return phone;
  }
  
  return `+${cleaned}`;
}

export function formatPhoneForDialing(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function getPhoneNumberDigitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isRealPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // Check if it matches a real phone number pattern (starts with + and has digits)
  return /^\+?[\d\s\-()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
