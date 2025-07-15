import Shipping from '../../models/Shipping.js';

export const deleteShipping = async (id, userId) => {
    const shipping = await Shipping.findOne({ _id: id, senderId: userId });

    if (!shipping) {
        throw new Error("Shipping not found or you don't have permission to delete it.");
    }

    if (shipping.status !== 'PENDING' && shipping.status !== 'SHIPPED') {
        throw new Error("Cannot cancel a shipment that has already been delivered.");
    }

    shipping.status = 'CANCELLED';
    await shipping.save();
    
    return true;
};