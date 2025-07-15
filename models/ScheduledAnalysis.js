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

scheduledAnalysisSchema.index({ user: 1, startTime: -1 });


export default mongoose.model('ScheduledAnalysis', scheduledAnalysisSchema);
