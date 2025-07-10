const { Storage } = require("@google-cloud/storage");

let storage;

if (process.env.GCP_CMS_SERVICE_ACCOUNT_BASE64) {
  const serviceAccountJSON = JSON.parse(
    Buffer.from(process.env.GCP_CMS_BASE64, "base64").toString("utf-8")
  );

  storage = new Storage({ credentials: serviceAccountJSON });
} else {
  storage = new Storage(); // fallback to default creds
}

module.exports = { storage };