const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

let blobServiceClient = null;

if (connectionString) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } catch (err) {
    console.error("Invalid Azure connection string:", err.message);
  }
}

module.exports = blobServiceClient;