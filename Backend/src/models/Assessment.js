const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  milestonePhase: { type: Number },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true, select: false }
  }],
  passingScore: { type: Number, default: 60, min: 0, max: 100 }
}, { timestamps: true });

assessmentSchema.index({ courseId: 1, milestonePhase: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
