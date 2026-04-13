import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { createOrder, getOrder } from '../models/Order.js';
import { sendConfirmationEmail } from '../utils/email.js';
import { createStockAlert, getStockAlerts } from '../models/StockAlert.js';
import { createEmailSubscriber } from '../models/EmailSubscriber.js';
import { createSMSSubscriber } from '../models/SMSSubscriber.js';
import { sendStockAlertSMS } from '../utils/sms.js';
import { subscribeToMailingList, sendWelcomeEmail } from '../utils/emailMarketing.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Raw body pour webhooks Stripe
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB error:', err.message));

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, email, firstName, lastName, cart } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Montant invalide (min 1€)' });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'eur',
      metadata: {
        email,
        firstName,
        lastName,
        itemCount: cart ? cart.length : 0
      }
    });

    // Save order to DB
    const order = await createOrder({
      stripe_id: paymentIntent.id,
      email,
      firstName,
      lastName,
      amount,
      cart,
      status: 'pending'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id
    });
  } catch (error) {
    console.error('Payment Intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Payment (after client-side confirmation)
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order
      const order = await getOrder(orderId);
      order.status = 'paid';
      order.paid_at = new Date();
      await order.save();

      // Send confirmation email
      await sendConfirmationEmail(order);

      return res.json({
        success: true,
        message: 'Paiement confirmé',
        orderId
      });
    }

    res.status(400).json({ error: 'Paiement non confirmé' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 3 MISSING ROUTES
// ============================================================

// 1️⃣  STOCK ALERT — /api/stock-alert
app.post('/api/stock-alert', async (req, res) => {
  try {
    const { prodId, email, productName } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const alert = await createStockAlert({
      productId: prodId,
      productName: productName || `Product #${prodId}`,
      email,
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Stock alert créé',
      alertId: alert._id
    });
  } catch (error) {
    console.error('Stock alert error:', error);
    // Don't fail if duplicate
    if (error.message.includes('duplicate')) {
      return res.json({ success: true, message: 'Alerte déjà enregistrée' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 2️⃣  EMAIL MARKETING — /api/subscribe-email
app.post('/api/subscribe-email', async (req, res) => {
  try {
    const { email, firstName = '', lastName = '' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Generate discount code
    const discountCode = 'WELCOME' + Math.random().toString(36).slice(2, 7).toUpperCase();

    // Save to DB
    const subscriber = await createEmailSubscriber(email, discountCode);

    // Add to Mailchimp list
    await subscribeToMailingList(email, firstName, lastName);

    // Send welcome email with discount
    await sendWelcomeEmail(email);

    res.json({
      success: true,
      message: 'Email enregistré avec succès',
      discountCode,
      email
    });
  } catch (error) {
    console.error('Email subscription error:', error);
    if (error.message.includes('duplicate')) {
      return res.json({ success: true, message: 'Email déjà inscrit' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 3️⃣  SMS MARKETING — /api/subscribe-sms
app.post('/api/subscribe-sms', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Numéro invalide' });
    }

    // Format phone number (remove spaces/special chars)
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = '+' + cleanPhone;

    // Save to DB
    const subscriber = await createSMSSubscriber(formattedPhone, 'FR');

    // Send confirmation SMS
    await sendStockAlertSMS(formattedPhone, 'Bienvenue sur Tasty Crousty!');

    res.json({
      success: true,
      message: 'SMS marketing activé',
      phone: formattedPhone
    });
  } catch (error) {
    console.error('SMS subscription error:', error);
    if (error.message.includes('duplicate')) {
      return res.json({ success: true, message: 'Numéro déjà enregistré' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// EXISTING ROUTES
// ============================================================

// Stripe Webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('✓ Payment succeeded:', paymentIntent.id);

      // Update order
      const order = await getOrder(paymentIntent.metadata.orderId);
      if (order) {
        order.status = 'paid';
        order.paid_at = new Date();
        await order.save();
        await sendConfirmationEmail(order);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Export for Vercel
export default app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
