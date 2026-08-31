const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  careerTarget: { type: String, required: true, trim: true, maxlength: 200 },
  targetDate: { type: Date },
  weeklyLearningHours: { type: Number, required: true, min: 0, max: 168 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  timeSpentHours: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'completed', 'paused', 'archived'], default: 'active' }
}, { timestamps: true });

goalSchema.index({ status: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
