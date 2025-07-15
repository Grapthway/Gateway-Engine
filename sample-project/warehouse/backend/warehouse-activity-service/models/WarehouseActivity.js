import mongoose from 'mongoose';

const warehouseActivitySchema = new mongoose.Schema({
  shippingId: {
    type: String,
    required: true,
    index: true,
  },
  // The user this activity log belongs to
  userId: {
    type: String,
    required: true,
    index: true,
  },
  // Type of activity, e.g., 'SENT', 'RECEIVED', 'UPDATED', 'CANCELLED'
  activityType: {
    type: String,
    required: true,
    enum: ['SENT', 'RECEIVED', 'UPDATED', 'CANCELLED'],
  },
  notes: {
    type: String,
  },
  // Details of the item involved
  itemDetails: {
      name: String,
      quantity: Number
  },
  // The other party in the transaction
  counterparty: {
      userId: String,
      name: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

warehouseActivitySchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('WarehouseActivity', warehouseActivitySchema);