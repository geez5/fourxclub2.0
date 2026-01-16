// src/lib/PayU.ts
// Payment processing temporarily disabled for demo

export const PayU = null;

// Add PRICES export
export const PRICES = {
  discord: {
    INR: 149,
    USD: 2
  }
} as const;

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF','CLP','DJF','GNF','JPY','KMF','KRW','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF'
]);

export function toSmallestUnit(amount: number, currency = 'INR') {
  const cur = (currency || 'INR').toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(cur)) return Math.round(amount);
  return Math.round(amount * 100);
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  console.log('⚠️ Payment verification disabled');
  return true;
}

// Dummy function to prevent import errors
export async function createOrder(amount: number, currency: string, receipt: string) {
  throw new Error('Payment processing temporarily disabled. Use access code instead.');
}