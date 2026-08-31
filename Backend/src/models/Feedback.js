const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['course', 'recommendation', 'platform'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  rating: { type: Number, min: 1, max: 5 },
  sentiment: { type: String, enum: ['too_easy', 'too_difficult', 'relevant', 'not_relevant'] },
  comment: { type: String }
}, { timestamps: true });

feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
