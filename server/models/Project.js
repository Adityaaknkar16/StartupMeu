const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    members: [memberSchema]
  },
  {
    timestamps: true
  }
);

// Helper method to verify if a given userId is a project member or owner
projectSchema.methods.isMember = function (userId) {
  if (!userId) return false;
  const idStr = userId.toString();
  if (this.owner.toString() === idStr) return true;
  return this.members.some((m) => m.user.toString() === idStr);
};

// Helper method to verify if a given userId is the project owner
projectSchema.methods.isOwner = function (userId) {
  if (!userId) return false;
  return this.owner.toString() === userId.toString();
};

// Indexes for fast project queries
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
