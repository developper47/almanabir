import mongoose from 'mongoose';

const ZadAlKhatibSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.ZadAlKhatib || mongoose.model('ZadAlKhatib', ZadAlKhatibSchema);
