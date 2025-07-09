import mongoose from 'mongoose';

const RecordingsessionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  videoURL: { type: String }
});

export default mongoose.model('RecordingSessionLog', RecordingsessionLogSchema);
