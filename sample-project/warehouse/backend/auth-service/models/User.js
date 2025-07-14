import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  address: String,
  postalCode: String,
  gender: String,
  role: { type: String, default: 'user' }
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Add virtual id field that returns _id as string
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

const User = mongoose.model('User', userSchema);
export default User;