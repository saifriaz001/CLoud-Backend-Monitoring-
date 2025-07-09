import mongoose from 'mongoose';

const AppUsedSchema = new mongoose.Schema({
  name: String,
  category: String,
  purpose: String,
  durationEstimate: String
}, { _id: false });

const ScreenshotInsightsSchema = new mongoose.Schema({
  appsDetected: [String],
  codeFiles: [String],
  terminalsVisible: Boolean,
  activitiesObserved: [String]
}, { _id: false });

const DistractionSchema = new mongoose.Schema({
  app: String,
  contentType: String,
  durationEstimate: String,
  comment: String
}, { _id: false });

const SuspiciousEventSchema = new mongoose.Schema({
  timestamp: Date,
  event: String,
  filePath: String,
  process: String,
  comment: String
}, { _id: false });

const UnfocusedScreenshotSchema = new mongoose.Schema({
  timestamp: Date,
  comment: String
}, { _id: false });

const RedundantScreenshotSchema = new mongoose.Schema({
  count: Number,
  duration: String,
  comment: String
}, { _id: false });

const ProlongedStaticWindowSchema = new mongoose.Schema({
  app: String,
  duration: String,
  start: Date,
  end: Date,
  comment: String
}, { _id: false });

const ProductivityAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeWindow: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  appsUsed: [AppUsedSchema],
  screenshotInsights: ScreenshotInsightsSchema,
  distractions: [DistractionSchema],
  neutralApps: [String],
  suspiciousEvents: [SuspiciousEventSchema],
  prolongedStaticWindow: ProlongedStaticWindowSchema,
  unfocusedScreenshots: [UnfocusedScreenshotSchema],
  redundantScreenshots: RedundantScreenshotSchema,
  productivityScore: Number,
  scoreExplanation: String,
  summary: String,
  detailedObservation: String
}, {
  timestamps: true // Adds createdAt / updatedAt
});

export default mongoose.model('ProductivityAnalysis', ProductivityAnalysisSchema);
