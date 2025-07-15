import mongoose from "mongoose";

const fileLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: String, required: true },
  type: { type: String, default: 'File' },
  path: { type: String },
  oldPath: { type: String },
  newPath: { type: String },
  process: { type: String },
  timestamp: { type: String , required: true },
  source: { type: String, default: 'FileMonitorDriver' },
  message: { type: String },
  type:{type:String}, // Default to "Agent" if not provided
  createdAt: { type: Date, default: Date.now }
});

fileLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('FileLog', fileLogSchema);