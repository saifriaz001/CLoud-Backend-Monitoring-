// models/ScreenshotLog.js
import mongoose from 'mongoose';

const ScreenshotLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  imageURL: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  type:{
    type: String,
    default: 'Screenshot'
  }
});

export default mongoose.model('ScreenshotLog', ScreenshotLogSchema);
