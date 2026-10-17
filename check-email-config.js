require("dotenv").config();

if (process.env.SENDPOSITORY_API_KEY) {
  console.log("Sendpository API key loaded successfully.");
} else {
  console.log("API key not found. Check your .env file.");
}