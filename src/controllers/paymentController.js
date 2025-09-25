import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const fedapay = axios.create({
  baseURL: process.env.FEDAPAY_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.FEDAPAY_PAYMENT_KEY}`,
    "Content-Type": "application/json"
  }
});

// 👉 Créer un paiement
export const createPayment = async (req, res) => {
  try {
    const { amount, currency, description, customer_email } = req.body;

    const response = await fedapay.post("/transactions", {
      description,
      amount,
      currency, // ex: "XOF"
      callback_url: "https://ton-site.com/payment/callback",
      customer: {
        email: customer_email
      }
    });

    res.status(201).json({
      success: true,
      payment_url: response.data.transaction.url,
      transaction_id: response.data.transaction.id
    });
  } catch (error) {
    console.error("Fedapay Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Payment creation failed" });
  }
};

// 👉 Vérifier le statut d’un paiement
export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const response = await fedapay.get(`/transactions/${transactionId}`);

    res.status(200).json({
      success: true,
      status: response.data.transaction.status
    });
  } catch (error) {
    console.error("Fedapay Status Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to check payment status" });
  }
};
