import mongoose from 'mongoose';

const SMSSubscriberSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    country: { type: String, default: 'FR' },
    verified: { type: Boolean, default: false },
    lastSMSSentAt: Date,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

SMSSubscriberSchema.index({ phone: 1 }, { unique: true });

const SMSSubscriber = mongoose.model('SMSSubscriber', SMSSubscriberSchema);

export async function createSMSSubscriber(phone, country = 'FR') {
  try {
    const subscriber = new SMSSubscriber({ phone, country });
    await subscriber.save();
    return subscriber;
  } catch(err) {
    if (err.code === 11000) {
      // Numéro déjà enregistré
      return SMSSubscriber.findOne({ phone });
    }
    throw err;
  }
}

export async function getSMSSubscriber(phone) {
  return SMSSubscriber.findOne({ phone });
}

export default SMSSubscriber;
