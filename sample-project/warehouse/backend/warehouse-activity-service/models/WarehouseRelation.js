import mongoose from 'mongoose';

const warehouseRelationSchema = new mongoose.Schema({
  // The user who initiated the relation
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  // The email of the owner, for bidirectional lookups
  ownerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // The user who is being related to
  partnerId: {
    type: String,
    required: true,
    index: true,
  },
  // The email of the partner, for easier lookup
  partnerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
  },
  // Status of the relationship, e.g., 'ACTIVE', 'BLOCKED'
  status: {
    type: String,
    required: true,
    default: 'ACTIVE',
    enum: ['ACTIVE', 'BLOCKED'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Ensure a user cannot have the same partner twice
warehouseRelationSchema.index({ ownerId: 1, partnerId: 1 }, { unique: true });

warehouseRelationSchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('WarehouseRelation', warehouseRelationSchema);