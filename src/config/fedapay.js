import axios from 'axios';

const API_URL = process.env.FEDAPAY_API_URL;
const API_KEY = process.env.FEDAPAY_PAYMENT_KEY;

if (!API_URL || !API_KEY) {
  console.warn('Fedapay config missing - set FEDAPAY_API_URL and FEDAPAY_PAYMENT_KEY');
}

export async function createCheckout(amountCents, currency = 'XOF', metadata = {}) {
  // amountCents example: 1000 -> 10.00
  try {
    const payload = {
      amount: amountCents,
      currency,
      metadata
    };
    const res = await axios.post(`${API_URL}/payments`, payload, {
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    console.error('Fedapay createCheckout error', err?.response?.data || err.message);
    throw err;
  }
}

export async function createPayout(recipient) {
  try {
    const res = await axios.post(`${API_URL}/transfers`, recipient, {
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    console.error('Fedapay createPayout error', err?.response?.data || err.message);
    throw err;
  }
}
