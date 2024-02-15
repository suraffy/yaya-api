const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require("cors");
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// API credentials (from .env)
const apiKey = process.env.YAYA_API_KEY;
const apiSecret = process.env.YAYA_API_SECRET;
const baseUrl = process.env.YAYA_BASE_URL; // Include base URL from env

// Endpoint and method
const endpoint = "/api/en/transaction/find-by-user";
const method = "GET";
// Function to generate signature
function generateSignature(timestamp, body) {
  const preHashString = `${timestamp}${method}${endpoint}${body}`;
  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(preHashString);
  return Buffer.from(hmac.digest()).toString("base64");
}
// Route to handle transaction retrieval
app.get("/transactions", async (req, res) => {
  try {
    // Get current timestamp
    const timestamp = Date.now();
    // Generate signature using empty body for GET request
    const signature = generateSignature(timestamp, "");
    // Build authentication headers
    const headers = {
      "YAYA-API-KEY": apiKey,
      "YAYA-API-TIMESTAMP": timestamp,
      "YAYA-API-SIGN": signature,
    };

    // Make API request to YAYA END POINT API
    const response = await axios.get(`${baseUrl}${endpoint}`, { headers });
    // Handle successful response
    // console.log(response);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transactions");
  }
});

app.listen(port, "localhost", () =>
  console.log(`App runing on port ${port}...`)
);
