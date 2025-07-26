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

// Unified endpoint: POST /api/chat
// router.post('/', async (req, res) => {
//   try {
//     const { userId, message, sessionId } = req.body;

//     if (!userId || !message) {
//       return res.status(400).json({
//         success: false,
//         message: 'userId and message are required'
//       });
//     }

//     let session;

//     if (sessionId) {
//       session = await ConversationSession.findOne({ sessionId });
//     }

//     if (!session) {
//       const newSessionId = `sess-${Date.now()}`;
//       session = await ConversationSession.create({
//         sessionId: newSessionId,
//         userId
//       });
//     }

//     // Save user message
//     const userMessage = await Message.create({
//       sessionId: session.sessionId,
//       sender: 'user',
//       message
//     });

//     // Generate dummy AI response
//     const aiReplyText = `This is a dummy AI response to: "${message}"`;

//     const aiMessage = await Message.create({
//       sessionId: session.sessionId,
//       sender: 'ai',
//       message: aiReplyText
//     });

//     return res.json({
//       success: true,
//       sessionId: session.sessionId,
//       messages: [userMessage, aiMessage]
//     });

//   } catch (err) {
//     console.error('Chat API Error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


//const express = require('express');
//const router = express.Router();
//const Message = require('../models/Message');
//const ConversationSession = require('../models/ConversationSession');
const askLLM = require('../utils/llm');

router.post('/', async (req, res) => {
  try {
    const { userId, message, sessionId } = req.body;

    // Create new session if needed
    let session = sessionId;
    if (!session) {
      const newSession = await ConversationSession.create({
        userId,
        sessionId: `sess-${Date.now()}`
      });
      session = newSession.sessionId;
    }

    // Save user message
    await Message.create({
      sessionId: session,
      sender: 'user',
      message
    });

    // Ask LLM
    const aiReplyText = await askLLM(message);

    // Save AI message
    await Message.create({
      sessionId: session,
      sender: 'ai',
      message: aiReplyText
    });

    // Return messages
    const messages = await Message.find({ sessionId: session }).sort({ timestamp: 1 });

    res.json({
      success: true,
      sessionId: session,
      messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
