import mongoose from 'mongoose';

const scheduledAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  scheduled: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('ScheduledAnalysis', scheduledAnalysisSchema);
