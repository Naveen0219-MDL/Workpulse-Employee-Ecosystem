import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for fast aggregation by work day
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
    punchIn: {
      type: Date,
      required: true,
    },
    punchOut: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Office / Remote',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find user sessions per day
attendanceSchema.index({ user: 1, date: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
