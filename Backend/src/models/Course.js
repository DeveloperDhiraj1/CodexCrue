const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  provider: { type: String, trim: true, default: 'CortexCrew' },
  language: { type: String, enum: ['en', 'hi', 'hinglish'], default: 'en', index: true },
  contentType: { type: String, enum: ['course', 'video', 'documentation', 'practice', 'project'], default: 'course', index: true },
  sourceUrl: { type: String, trim: true },
  isFree: { type: Boolean, default: false, index: true },
  qualityScore: { type: Number, min: 0, max: 1, default: 0.5, index: true },
  skills: [{ type: String, index: true }],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: String, required: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  category: { type: String, required: true, index: true },
  tags: [{ type: String }],
  resources: [{ title: String, url: String, type: String }],
  rating: { type: Number, default: 0.0, min: 0, max: 5 },
  thumbnail: { type: String },
  status: { type: String, enum: ['published', 'draft'], default: 'published' }
}, { timestamps: true });

courseSchema.index({ status: 1, category: 1, createdAt: -1 });
courseSchema.index({ skills: 1, difficulty: 1 });

module.exports = mongoose.model('Course', courseSchema);
