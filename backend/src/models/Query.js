import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const querySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Query title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Query description is required'],
    },
    category: {
      type: String,
      enum: ['task_blocker', 'technical', 'hr_payroll', 'general'],
      default: 'task_blocker',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved'],
      default: 'open',
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyDomain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    responses: [responseSchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Query = mongoose.model('Query', querySchema);
