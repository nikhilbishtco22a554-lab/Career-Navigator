const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String },
  redirectUrl: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
