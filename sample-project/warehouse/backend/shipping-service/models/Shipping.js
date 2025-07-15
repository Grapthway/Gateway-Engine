import mongoose from 'mongoose';

const shippingItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    }
}, { _id: false });

const shippingSchema = new mongoose.Schema({
  items: [shippingItemSchema],
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  recipientName: {
      type: String,
      required: true
  },
  // The user who sent the shipment
  senderId: {
    type: String,
    required: true,
    index: true,
  },
  // The user who will receive the shipment
  recipientId: {
    type: String,
    required: true,
    index: true,
  },
  // Status of the shipment
  status: {
    type: String,
    required: true,
    default: 'PENDING',
    enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

shippingSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Shipping', shippingSchema);