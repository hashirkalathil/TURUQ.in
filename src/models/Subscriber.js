import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  name: {
    type: String,
    trim: true,
    default: null
  },
  whatsapp: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

if (mongoose.models.Subscriber) {
  delete mongoose.models.Subscriber;
}

export default mongoose.model('Subscriber', SubscriberSchema);
