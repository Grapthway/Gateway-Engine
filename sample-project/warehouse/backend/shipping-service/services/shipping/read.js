import Shipping from '../../models/Shipping.js';

export const getShippingById = async (id, userId) => {
  return Shipping.findOne({ _id: id, $or: [{ senderId: userId }, { recipientId: userId }] });
};

export const getAllShippingsForUser = async (userId, { type, startDate, endDate, page = 1, limit = 10 }) => {
    
    const query = type === 'DELIVERY' ? { senderId: userId } : { recipientId: userId };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    const totalItems = await Shipping.countDocuments(query);
    const shippings = await Shipping.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
    
    return { shippings, totalItems };
};