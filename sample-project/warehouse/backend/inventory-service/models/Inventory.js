import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Foreign key to the Category (as a string ID, since it's in another service)
  categoryId: {
    type: String,
    required: true,
    index: true
  },
  // Multi-tenancy key
  userId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

inventorySchema.virtual('id').get(function() {
  return this._id.toString();
});

export default mongoose.model('Inventory', inventorySchema);