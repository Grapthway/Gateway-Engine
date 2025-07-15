import mongoose from 'mongoose';

const uri =
  process.env.MONGO_URI ||
  'mongodb://admin:password@localhost:27017/ecommerce?authSource=admin';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));