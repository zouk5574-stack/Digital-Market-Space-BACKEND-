// src/config/fedapay.js
import axios from "axios";
import pool from "./db.js";

// Récupérer les clés API depuis la table settings
async function getFedaPayConfig() {
  const result = await pool.query(
    "SELECT fedapay_public_key, fedapay_secret_key FROM settings ORDER BY id DESC LIMIT 1"
  );

  if (result.rows.length === 0) {
    throw new Error("⚠️ Clés Fedapay manquantes dans settings");
  }

  const { fedapay_secret_key } = result.rows[0];
  return {
    apiUrl: "https://sandbox-api.fedapay.com/v1", // ou prod si tu veux switch
    apiKey: fedapay_secret_key
  };
}

// Créer un paiement
export async function createCheckout(amountCents, currency = "XOF", metadata = {}) {
  try {
    const { apiUrl, apiKey } = await getFedaPayConfig();

    const payload = {
      amount: amountCents,
      currency,
      metadata
    };

    const res = await axios.post(`${apiUrl}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    return res.data;
  } catch (err) {
    console.error("❌ Fedapay createCheckout error:", err?.response?.data || err.message);
    throw err;
  }
}
