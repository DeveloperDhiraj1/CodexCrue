const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['course_completed', 'milestone_completed', 'goal_completed', 'badge_earned'], required: true },
  referenceId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  points: { type: Number, required: true, min: 0 },
  icon: { type: String, default: '🏆' },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

rewardSchema.index({ userId: 1, type: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('Reward', rewardSchema);
