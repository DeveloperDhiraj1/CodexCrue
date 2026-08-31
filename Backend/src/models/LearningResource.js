const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  url: { type: String, required: true, unique: true, trim: true },
  provider: { type: String, required: true, trim: true },
  sourceType: { type: String, enum: ['official', 'course', 'video', 'article', 'documentation'], default: 'course' },
  skills: [{ type: String, trim: true }],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  durationMinutes: { type: Number, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  qualityScore: { type: Number, min: 0, max: 1, default: 0.5 },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  lastVerifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

learningResourceSchema.index({ status: 1, skills: 1, qualityScore: -1 });
learningResourceSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('LearningResource', learningResourceSchema);
