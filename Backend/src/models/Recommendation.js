const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  score: { type: Number, required: true, min: 0, max: 1 },
  explanation: { type: String, required: true },
  isAccepted: { type: Boolean, default: false },
  rank: { type: Number, min: 1 },
  modelVersion: { type: String },
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, { timestamps: true });

recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ userId: 1, courseId: 1, createdAt: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
