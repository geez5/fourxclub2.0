export async function createOrderClient(
  amount: number,
  currency?: string,
  receipt?: string
) {
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount')
  }

  const cur = (currency || process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'INR').toUpperCase()
  if (!/^[A-Z]{3}$/.test(cur)) {
    throw new Error('Invalid currency')
  }

  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: cur, receipt })
  })

  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error || 'Failed to create order')
  return payload
}