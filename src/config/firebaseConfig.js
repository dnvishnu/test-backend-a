const { GoogleAuth } = require("google-auth-library");

// Decode base64 string from env and parse as JSON
const serviceAccountJSON = JSON.parse(
  Buffer.from(process.env.CUSTOMER_WEBSITES_1_BASE64, "base64").toString("utf-8")
);

const auth = new GoogleAuth({
  credentials: serviceAccountJSON,
  scopes: [
    "https://www.googleapis.com/auth/firebase.hosting",
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/firebase",
  ],
});

async function getAccessToken() {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

module.exports = {
  getAccessToken,
};
