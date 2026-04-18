import mongoose from 'mongoose';

const KhutbaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  preacher: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String },
  status: { type: String, default: 'معلق' },
  views: { type: Number, default: 0 },
  date: { type: String },
  isRare: { type: Boolean, default: false },
  isMasterpiece: { type: Boolean, default: false },
  isProphetic: { type: Boolean, default: false },
  files: {
    youtube: String,
    audio: String,
    video: String,
    pdf: String,
    word: String
  }
}, { timestamps: true });

export default mongoose.models.Khutba || mongoose.model('Khutba', KhutbaSchema);
