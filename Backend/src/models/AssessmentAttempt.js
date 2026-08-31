const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  answers: [{ type: String, required: true }],
  score: { type: Number, required: true, min: 0, max: 100 },
  passed: { type: Boolean, required: true },
  passingScore: { type: Number, required: true, min: 0, max: 100 }
}, { timestamps: true });

assessmentAttemptSchema.index({ userId: 1, assessmentId: 1, createdAt: -1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
