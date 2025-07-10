const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = "your-azure-connection-string";

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

module.exports = blobServiceClient;
