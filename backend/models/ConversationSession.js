const mongoose = require('mongoose');

const conversationSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
});

module.exports = mongoose.model('ConversationSession', conversationSessionSchema);
