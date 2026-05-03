const mongoose = require('mongoose');
const savedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String },
  company: { type: String },
  location: { type: String },
  salary: { type: String },
  redirectUrl: { type: String },
  savedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('SavedJob', savedJobSchema);
