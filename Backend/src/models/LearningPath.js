const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  estimatedDuration: { type: String, required: true },
  milestones: [{
    milestoneId: { type: String, required: true },
    phase: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    skills: [{ type: String }],
    learningObjectives: [{ type: String }],
    activities: [{
      type: { type: String, enum: ['lesson', 'practice', 'assignment', 'project', 'assessment'] },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      title: { type: String, required: true },
      description: { type: String },
      estimatedMinutes: { type: Number, min: 1 },
      url: { type: String },
      completed: { type: Boolean, default: false }
    }],
    prerequisitePhases: [{ type: Number }],
    estimatedDuration: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['locked', 'available', 'in_progress', 'completed'], default: 'locked' }
  }],
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' }
}, { timestamps: true });

learningPathSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('LearningPath', learningPathSchema);
