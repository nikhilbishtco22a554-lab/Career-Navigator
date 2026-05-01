const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    /**
     * Reference to the User who saved the job.
     */
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    /**
     * The title of the saved job.
     */
    jobTitle: { type: String },

    /**
     * The company offering the saved job.
     */
    company: { type: String },

    /**
     * The location for the saved job.
     */
    location: { type: String },

    /**
     * Redirect URL for the saved job posting.
     */
    redirectUrl: { type: String },

    /**
     * The timestamp when the job was saved.
     */
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedJob', savedJobSchema);
