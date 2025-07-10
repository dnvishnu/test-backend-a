const chatbotService = require("../services/chatbotService");

async function saveChatSession(req, res) {
  try {
    const data = await chatbotService.saveOrUpdateSession(req.body);
    res.status(data.status).json(data.response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save or update chat session" });
  }
}

async function getChatSessions(req, res) {
  try {
    const sessions = await chatbotService.getSessionList(req.params.assistant_id, req.params.user_email);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session list" });
  }
}

async function getSessionMessages(req, res) {
  try {
    const session = await chatbotService.getSessionMessages(
      req.params.assistant_id,
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

async function saveUserProfile(req, res) {
  try {
    const data = await chatbotService.saveOrUpdateUserProfile(req.body);
    res.status(data.status).json(data.response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save or update user profile" });
  }
}

async function getUserProfile(req, res) {
  try {
    const profile = await chatbotService.getUserProfile(
      req.params.assistant_id,
      req.params.user_email
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile.user_info);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

module.exports = {
  saveChatSession,
  getChatSessions,
  getSessionMessages,
  saveUserProfile,
  getUserProfile,
};
