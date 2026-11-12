const GATEWAY_URL = "https://connector-gateway.lovable.dev/paypal";
export const paypalConfigured = () => Boolean(process.env['LOVABLE_API_KEY'] && process.env['PAYPAL_API_KEY']);
export async function paypal(path: string, init: RequestInit = {}) {
  const L = process.env['LOVABLE_API_KEY'], P = process.env['PAYPAL_API_KEY'];
  if (!L || !P) throw new Error("PayPal is not connected yet");
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${L}`, "X-Connection-Api-Key": P, "Content-Type": "application/json", Accept: "application/json", ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) { console.error(`PayPal ${res.status}: ${text}`); throw new Error(`PayPal request failed (${res.status})`); }
  return text ? JSON.parse(text) : {};
}
