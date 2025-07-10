const ChatHistory = require("../models/chatHistoryModel");
const UserProfile = require("../models/userProfileModel");

async function saveOrUpdateSession({ title, assistant_id, user_email, session_id, messages }) {
  const existingSession = await ChatHistory.findOne({ assistant_id, user_email, session_id });

  if (existingSession) {
    existingSession.messages.push(...messages);
    const updated = await existingSession.save();
    return {
      status: 200,
      response: { message: "Messages appended", session: updated },
    };
  }

  const newSession = new ChatHistory({ title, assistant_id, user_email, session_id, messages });
  const saved = await newSession.save();

  return {
    status: 201,
    response: { message: "New session created", session: saved },
  };
}

async function getSessionList(assistant_id, user_email) {
  return await ChatHistory.find(
    { assistant_id, user_email },
    { _id: 0, session_id: 1, title: 1 }
  ).sort({ created_at: -1 });
}

async function getSessionMessages(assistant_id, user_email, session_id) {
  return await ChatHistory.findOne(
    { assistant_id, user_email, session_id },
    { _id: 0, messages: 1, title: 1 }
  );
}

async function saveOrUpdateUserProfile({ assistant_id, user_email, user_info }) {
  if (!assistant_id || !user_email || !Array.isArray(user_info)) {
    return { status: 400, response: { error: "Missing or invalid fields" } };
  }

  const existing = await UserProfile.findOne({ assistant_id, user_email });

  if (existing) {
    existing.user_info = user_info;
    existing.updated_at = new Date();
    const updated = await existing.save();
    return { status: 200, response: { message: "Profile updated", profile: updated } };
  }

  const newProfile = new UserProfile({ assistant_id, user_email, user_info });
  const saved = await newProfile.save();

  return { status: 201, response: { message: "Profile created", profile: saved } };
}

async function getUserProfile(assistant_id, user_email) {
  return await UserProfile.findOne({ assistant_id, user_email }, { _id: 0, user_info: 1 });
}

module.exports = {
  saveOrUpdateSession,
  getSessionList,
  getSessionMessages,
  saveOrUpdateUserProfile,
  getUserProfile,
};
