const { Storage } = require("@google-cloud/storage");
const storage = new Storage(); // Cloud Run auto uses attached service account
module.exports = { storage };
