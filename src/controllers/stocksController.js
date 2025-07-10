const stocksService = require("../services/stocksService");

async function saveSession(req, res) {
  try {
    const data = await stocksService.saveOrUpdateSession(req.body);
    res.status(data.status).json(data.response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save or update chat session" });
  }
}

async function getSessions(req, res) {
  try {
    const sessions = await stocksService.getSessionList(req.params.company, req.params.user_email);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session list" });
  }
}

async function getMessages(req, res) {
  try {
    const session = await stocksService.getSessionMessages(
      req.params.company,
      req.params.user_email,
      req.params.session_id
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

module.exports = {
  saveSession,
  getSessions,
  getMessages,
};
