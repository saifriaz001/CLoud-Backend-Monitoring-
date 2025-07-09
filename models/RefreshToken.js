import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: {
    type:String,
  },
  userAgent: {
    type:String
  },
  deviceId: {
    type:String
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
