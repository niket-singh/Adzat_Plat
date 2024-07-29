import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  requirements: { type: String },
  deliveredWork: { type: String },
  isAccepted: { type: Boolean, default: false },
  escrowStatus: {
    type: String,
    enum: ['funds_held', 'funds_released', 'funds_refunded'],
    default: 'funds_held'
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;