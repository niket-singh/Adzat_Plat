import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  revisions: { type: Number, default: 1 },
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Gig = mongoose.model('Gig', gigSchema);
export default Gig;