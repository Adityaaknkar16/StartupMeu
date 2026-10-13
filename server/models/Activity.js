const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created_task',
        'updated_task',
        'moved_task',
        'deleted_task',
        'created_project',
        'updated_project',
        'invited_member',
        'removed_member'
      ]
    },
    taskTitle: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    // Activity records are append-only logs
    timestamps: false
  }
);

// Compound index for querying recent activities of a project chronologically
activitySchema.index({ project: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
