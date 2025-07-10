const StocksChats = require("../models/stocksChatModel");

async function saveOrUpdateSession({ title, company, user_email, session_id, messages }) {
  const existingSession = await StocksChats.findOne({ company, user_email, session_id });

  if (existingSession) {
    existingSession.messages.push(...messages);
    const updated = await existingSession.save();
    return {
      status: 200,
      response: { message: "Messages appended", session: updated },
    };
  }

  const newSession = new StocksChats({ title, company, user_email, session_id, messages });
  const saved = await newSession.save();

  return {
    status: 201,
    response: { message: "New session created", session: saved },
  };
}

async function getSessionList(company, user_email) {
  return await StocksChats.find(
    { company, user_email },
    { _id: 0, session_id: 1, title: 1 }
  ).sort({ created_at: -1 });
}

async function getSessionMessages(company, user_email, session_id) {
  return await StocksChats.findOne(
    { company, user_email, session_id },
    { _id: 0, messages: 1, title: 1 }
  );
}

module.exports = {
  saveOrUpdateSession,
  getSessionList,
  getSessionMessages,
};
