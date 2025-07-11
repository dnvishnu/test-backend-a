const { Storage } = require("@google-cloud/storage");

const serviceAccountJSON = JSON.parse(
  Buffer.from(process.env.GCP_CMS_BASE64, "base64").toString("utf-8")
);

const storage = new Storage({ credentials: serviceAccountJSON });

module.exports = { storage };
