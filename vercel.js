{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "FEDAPAY_API_URL": "@fedapay_api_url",
    "FEDAPAY_PAYMENT_KEY": "@fedapay_payment_key"
  }
}
