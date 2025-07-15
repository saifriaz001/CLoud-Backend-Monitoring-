import mongoose from 'mongoose';

const SignUpSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobTitle: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Index for filtering by company
SignUpSchema.index({ company: 1 });

// ✅ Optional: Index for admin sorting
SignUpSchema.index({ createdAt: -1 });

const SignUp = mongoose.model('SignUp', SignUpSchema);
export default SignUp;
