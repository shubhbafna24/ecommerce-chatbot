const express = require('express');
const router = express.Router();
const ConversationSession = require('../models/ConversationSession');
const Message = require('../models/Message');

// Create a new conversation session
router.post('/session', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    const session = await ConversationSession.create({ userId, sessionId });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a message to a session
router.post('/message', async (req, res) => {
  try {
    const { sessionId, sender, message } = req.body;
    const msg = await Message.create({ sessionId, sender, message });
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all messages in a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const messages = await Message.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
