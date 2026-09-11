const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  // Retained for backwards compatibility with existing MongoDB documents.
  // New credentials are managed exclusively by Firebase Authentication.
  password: { type: String, select: false },
  role: { type: String, enum: ['learner', 'admin'], default: 'learner', index: true },
  isActive: { type: Boolean, default: true, index: true },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active', index: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.firebaseUid;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
