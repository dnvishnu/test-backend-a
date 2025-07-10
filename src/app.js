const express = require("express");
const cors = require("cors");
const cricketRoutes = require("./routes/cricketRoutes");
const cmsGcpRoutes = require("./routes/cmsGcpRoutes");
const cmsAzureRoutes = require("./routes/cmsAzureRoutes");
const llmRoutes = require("./routes/llmRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const firebaseRoutes = require("./routes/firebaseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/cricket", cricketRoutes);
app.use("/cms/gcp", cmsGcpRoutes);
app.use("/cms/azure", cmsAzureRoutes);
app.use("/chat", llmRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/firebase", firebaseRoutes);

module.exports = app;
