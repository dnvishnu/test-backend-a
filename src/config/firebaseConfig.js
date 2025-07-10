const { GoogleAuth } = require("google-auth-library");
const serviceAccount = require("../../customer-websites-1.json");

const auth = new GoogleAuth({
  credentials: serviceAccount,
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
