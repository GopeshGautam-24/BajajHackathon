const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = "gopesh0252.be23@chitkara.edu.in";



function getFibonacci(n) {
  if (!Number.isInteger(n) || n <= 0 || n > 1000)
    throw new Error("Invalid fibonacci input");

  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }
  return arr.slice(0, n);
}

function isPrime(num) {
  if (!Number.isInteger(num) || num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function hcfArray(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function lcmArray(arr) {
  return arr.reduce((a, b) => lcm(a, b));
}



app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});



app.post("/bfhl", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        is_success: false,
        error: "Invalid JSON body"
      });
    }

    const keys = Object.keys(req.body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key required"
      });
    }

    const key = keys[0];
    const value = req.body[key];
    let result;


    switch (key.toLowerCase()) {

      case "fibonacci":
        result = getFibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value) || value.some(x => !Number.isInteger(x))) {
          throw new Error("Prime expects integer array");
        }
        result = value.filter(isPrime);
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0 ||
            value.some(x => !Number.isInteger(x))) {
          throw new Error("HCF expects integer array");
        }
        result = hcfArray(value);
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0 ||
            value.some(x => !Number.isInteger(x))) {
          throw new Error("LCM expects integer array");
        }
        result = lcmArray(value);
        break;

      case "ai":
        if (typeof value !== "string") {
          throw new Error("AI expects string");
        }


        if (!process.env.GEMINI_KEY) {
          result = "AI_KEY_MISSING";
          break;
        }

        const aiResp = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
          {
            contents: [
              { parts: [{ text: value + " Answer in one word only." }] }
            ]
          }
        );

        result =
          aiResp.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "UNKNOWN";
        break;


      default:
        return res.status(400).json({
          is_success: false,
          error: "Invalid key"
        });
    }


    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });

  } catch (err) {
    return res.status(400).json({
      is_success: false,
      error: err.message || "Processing error"
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
