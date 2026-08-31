const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  learningGoal: { type: String, trim: true, maxlength: 200, default: '' },
  careerGoal: { type: String, trim: true, maxlength: 200, default: '' },
  learningComment: { type: String, trim: true, maxlength: 2000, default: '' },
  bio: { type: String, trim: true, maxlength: 500, default: '' },
  location: { type: String, trim: true, maxlength: 120, default: '' },
  education: {
    degree: { type: String, trim: true, maxlength: 120, default: '' },
    institution: { type: String, trim: true, maxlength: 160, default: '' },
    field: { type: String, trim: true, maxlength: 120, default: '' },
    graduationYear: { type: Number, min: 1950, max: 2200 }
  },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  currentSkills: [{ type: String, trim: true, maxlength: 100 }],
  interests: [{ type: String, trim: true, maxlength: 100 }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  preferredLearningStyle: { type: String },
  preferredLanguage: { type: String, enum: ['en', 'hi', 'hinglish'], default: 'en', index: true },
  availableHoursPerDay: { type: Number, default: 2, min: 0, max: 24 },
  targetCompletionDate: { type: Date },
  isOnboarded: { type: Boolean, default: false, index: true }

}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
