import mongoose from 'mongoose';

const activeWindowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  windowTitle: { type: String, required: true },
  application: { type: String, required: true },
  source:{type:String},
  type:{type:String},
  startTime: { type: Date, required: true },
  endTime: { type: Date }, // Optional, until user switches

});

activeWindowSchema.index({ user: 1, startTime: -1 });


export default mongoose.model('ActiveWindowLog', activeWindowSchema);
