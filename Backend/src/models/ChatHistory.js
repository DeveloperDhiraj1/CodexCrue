const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true, maxlength: 10000 },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

chatHistorySchema.index({ userId: 1 }, { unique: true });
chatHistorySchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
