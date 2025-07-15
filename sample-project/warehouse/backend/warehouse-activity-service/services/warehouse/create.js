import WarehouseRelation from '../../models/WarehouseRelation.js';
import WarehouseActivity from '../../models/WarehouseActivity.js';

export const createRelation = async (ownerId, ownerEmail, partnerId, partnerEmail) => {
  // Check if the relation already exists in either direction
  const existingRelation = await WarehouseRelation.findOne({
    $or: [
      { ownerId: ownerId, partnerId: partnerId },
      { ownerId: partnerId, partnerId: ownerId }
    ]
  });
  if (existingRelation) {
    throw new Error('A relationship with this partner already exists.');
  }

  // Prevent users from adding themselves
  if (ownerId === partnerId) {
      throw new Error("You cannot create a relation with yourself.");
  }

  const newRelation = await WarehouseRelation.create({
    ownerId,
    ownerEmail,
    partnerId,
    partnerEmail,
  });
  return newRelation;
};

export const createActivityBulk = async (args) => {
    const { shippingId, senderId, recipientId, senderName, recipientName, items, activityType } = args;
    const senderActivityType = activityType === 'DELETE' ? 'CANCELLED' : 'SENT';
    const recipientActivityType = activityType === 'DELETE' ? 'CANCELLED' : 'RECEIVED';
    const activitiesToCreate = [];
    for (const item of items) {
        activitiesToCreate.push({
            shippingId,
            userId: senderId,
            activityType: senderActivityType,
            notes: `Shipment of ${item.quantity} x ${item.itemName} to ${recipientName}.`
        });
        activitiesToCreate.push({
            shippingId,
            userId: recipientId,
            activityType: recipientActivityType,
            notes: `Shipment of ${item.quantity} x ${item.itemName} from ${senderName}.`
        });
    }
    if (activitiesToCreate.length > 0) {
        await WarehouseActivity.insertMany(activitiesToCreate);
    }
    return true;
};