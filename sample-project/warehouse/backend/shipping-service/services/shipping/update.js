import Shipping from '../../models/Shipping.js';

export const updateShipping = async (args, userId) => {
    const { id, ...updates } = args.input;

    const shipping = await Shipping.findOne({ _id: id, senderId: userId });

    if (!shipping) {
        throw new Error("Shipping not found or you don't have permission to edit it.");
    }

    if (shipping.status !== 'PENDING' && shipping.status !== 'SHIPPED') {
        throw new Error("Cannot update a shipment that is not PENDING or SHIPPED.");
    }

    Object.assign(shipping, updates);
    await shipping.save();
    return shipping;
};