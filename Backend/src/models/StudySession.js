const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
  studiedAt: { type: Date, required: true, default: Date.now },
  note: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

studySessionSchema.index({ userId: 1, studiedAt: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
