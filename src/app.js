const express = require("express");
const cors = require("cors");
const path = require("path");
const cricketRoutes = require("./routes/cricketRoutes");
const cmsGcpRoutes = require("./routes/cmsGcpRoutes");
const cmsAzureRoutes = require("./routes/cmsAzureRoutes");
const llmRoutes = require("./routes/llmRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const stocksRoutes = require("./routes/stocksRoutes");
const firebaseRoutes = require("./routes/firebaseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/cricket", cricketRoutes);
app.use("/cms/gcp", cmsGcpRoutes);
app.use("/cms/azure", cmsAzureRoutes);
app.use("/chat", llmRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/stocks", stocksRoutes);
app.use("/firebase", firebaseRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/home.html"));
});

module.exports = app;
