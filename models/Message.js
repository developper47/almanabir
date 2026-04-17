import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['read', 'unread'], default: 'unread' }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
