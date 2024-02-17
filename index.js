const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.use(cors());
const apiKey = process.env.YAYA_API_KEY;
const apiSecret = process.env.YAYA_API_SECRET;
const baseUrl = process.env.YAYA_BASE_URL;

function generateSignature(timestamp, method, endpoint, body) {
  const preHashString = `${timestamp}${method}${endpoint}${body}`;
  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(preHashString);
  return Buffer.from(hmac.digest()).toString("base64");
}

app.get("/transactions", async (req, res) => {
  const endpoint = "/api/en/transaction/find-by-user";
  const method = "GET";

  try {
    const timestamp = Date.now();

    const signature = generateSignature(timestamp, method, endpoint, "");

    const headers = {
      "YAYA-API-KEY": apiKey,
      "YAYA-API-TIMESTAMP": timestamp,
      "YAYA-API-SIGN": signature,
    };

    const queryParams = req.query;
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers,
      params: queryParams,
    });

    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transactions");
  }
});

app.post("/search", async (req, res) => {
  const endpoint = "/api/en/transaction/search";
  const method = "POST";
  const query = req.body;

  try {
    const timestamp = Date.now();

    const signature = generateSignature(
      timestamp,
      method,
      endpoint,
      JSON.stringify(query)
    );

    const headers = {
      "YAYA-API-KEY": apiKey,
      "YAYA-API-TIMESTAMP": timestamp,
      "YAYA-API-SIGN": signature,
    };

    const response = await axios.post(
      `${baseUrl}${endpoint}`,
      JSON.stringify(query),
      { headers }
    );

    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching transactions");
  }
});

app.listen(port, () => console.log(`App runing on port ${port}...`));
