import mongoose from 'mongoose';

const StockAlertSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: String,
    email: { type: String, required: true, lowercase: true },
    phone: String,
    status: { type: String, enum: ['pending', 'notified', 'completed'], default: 'pending' },
    notifiedAt: Date,
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index pour éviter les doublons
StockAlertSchema.index({ productId: 1, email: 1 }, { unique: true });

const StockAlert = mongoose.model('StockAlert', StockAlertSchema);

export async function createStockAlert(data) {
  try {
    const alert = new StockAlert(data);
    await alert.save();
    return alert;
  } catch(err) {
    if (err.code === 11000) {
      // Doublon - retourner l'existant
      return StockAlert.findOne({ productId: data.productId, email: data.email });
    }
    throw err;
  }
}

export async function getStockAlerts(productId) {
  return StockAlert.find({ productId, status: 'pending' });
}

export async function markAlertNotified(alertId) {
  return StockAlert.findByIdAndUpdate(alertId, { 
    status: 'notified', 
    notifiedAt: new Date() 
  });
}

export default StockAlert;
