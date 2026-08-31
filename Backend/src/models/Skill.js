const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true },
  description: { type: String },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }]
}, { timestamps: true });

skillSchema.index({ category: 1, name: 1 });
skillSchema.index({ prerequisites: 1 });

module.exports = mongoose.model('Skill', skillSchema);
