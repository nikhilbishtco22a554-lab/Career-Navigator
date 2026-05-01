const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    /**
     * The user's full name.
     */
    name: { type: String, required: true, trim: true },

    /**
     * The user's email address, used for login and uniqueness.
     */
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    /**
     * The user's hashed password.
     */
    password: { type: String, required: true },

    /**
     * The list of skills the user currently has.
     */
    skills: { type: [String], default: [] },

    /**
     * The job role the user wants to target.
     */
    targetRole: { type: String },

    /**
     * The generated career roadmap saved for the user.
     */
    savedRoadmap: {
      skillGaps: { type: [String], default: [] },
      roadmap: {
        type: [
          {
            week: { type: Number },
            topic: { type: String },
            resource: { type: String },
            provider: { type: String },
          },
        ],
        default: [],
      },
      interviewQuestions: { type: [String], default: [] },
      estimatedWeeks: { type: Number, default: 0 },
    },

    /**
     * The timestamp when the user record was created.
     */
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
