import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  stripe_id: String,
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  amount: { type: Number, required: true },
  cart: Array,
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'cancelled'], default: 'pending' },
  paid_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

export async function createOrder(data) {
  const order = new Order(data);
  return await order.save();
}

export async function getOrder(id) {
  return await Order.findById(id);
}

export async function updateOrder(id, data) {
  return await Order.findByIdAndUpdate(id, data, { new: true });
}

export default Order;
