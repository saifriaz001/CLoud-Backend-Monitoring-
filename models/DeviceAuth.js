// models/DeviceAuth.model.js
import mongoose from 'mongoose';

const DeviceAuthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('DeviceAuth', DeviceAuthSchema);
