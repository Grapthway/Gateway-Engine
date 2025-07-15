import Shipping from '../../models/Shipping.js';

export const createShipping = async (args, senderId, recipient) => {
  const { items, address, phoneNumber } = args.input;

  const newShipping = await Shipping.create({
    items: items.map(item => ({ name: item.itemName, quantity: item.quantity })),
    address,
    phoneNumber,
    recipientName: recipient.name,
    senderId,
    recipientId: recipient.id,
    status: 'SHIPPED',
  });

  return newShipping;
};