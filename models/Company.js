import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Optional: Index for sorting by most recent companies
companySchema.index({ createdAt: -1 });

const Company = mongoose.model('Company', companySchema);
export default Company;
