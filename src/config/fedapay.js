// src/config/fedapay.js
import db from "./db.js";

/**
 * Récupère les clés Fedapay depuis la DB (fallback -> .env si vide)
 */
export async function getFedaKeys() {
  const settings = await db.oneOrNone(
    "SELECT fedapay_api_url, fedapay_payment_key FROM settings LIMIT 1"
  );

  return {
    apiUrl: settings?.fedapay_api_url || process.env.FEDAPAY_API_URL_DEFAULT,
    apiKey: settings?.fedapay_payment_key || process.env.FEDAPAY_PAYMENT_KEY_DEFAULT,
  };
}
