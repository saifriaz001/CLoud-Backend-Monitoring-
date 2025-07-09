import mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['online', 'away', 'lunch', 'offline'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  date: String 
});

const userStatusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  sessions: [sessionSchema]
}, {
  timestamps: true
});

const UserStatus = mongoose.model('UserStatus', userStatusSchema);
export default UserStatus;
