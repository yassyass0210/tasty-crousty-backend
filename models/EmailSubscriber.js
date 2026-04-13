import mongoose from 'mongoose';

const EmailSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    discountCode: String,
    discountApplied: { type: Boolean, default: false },
    lastEmailSentAt: Date,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

EmailSubscriberSchema.index({ email: 1 }, { unique: true });

const EmailSubscriber = mongoose.model('EmailSubscriber', EmailSubscriberSchema);

export async function createEmailSubscriber(email, discountCode) {
  try {
    const subscriber = new EmailSubscriber({ email, discountCode });
    await subscriber.save();
    return subscriber;
  } catch(err) {
    if (err.code === 11000) {
      // Email déjà enregistré
      return EmailSubscriber.findOne({ email });
    }
    throw err;
  }
}

export async function getEmailSubscriber(email) {
  return EmailSubscriber.findOne({ email });
}

export default EmailSubscriber;
