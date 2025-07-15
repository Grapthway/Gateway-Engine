import Inventory from '../../models/Inventory.js';

export const updateInventory = async (args, userId) => {
  const { id, name, description, price, quantity, categoryId } = args;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (categoryId !== undefined) updateData.categoryId = categoryId;

  const updatedInventory = await Inventory.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true }
  );

  return updatedInventory;
};

export const decreaseInventoryForUser = async (id, amount, userId) => {
    const inventory = await Inventory.findOne({ _id: id, userId });
    if (!inventory) {
        throw new Error("Inventory item not found or you don't have permission.");
    }
    if (inventory.quantity < amount) {
        throw new Error(`Not enough stock for ${inventory.name}. Only ${inventory.quantity} available.`);
    }
    inventory.quantity -= amount;
    await inventory.save();
    return inventory;
};

export const decreaseInventoryBulkForUser = async (items, userId) => {
    const escapeRegex = (string) => {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const itemNames = items.map(item => item.itemName.trim());
    const searchNames = itemNames.map(name => new RegExp(`^${escapeRegex(name)}$`, 'i'));

    const inventoryItems = await Inventory.find({
        userId,
        name: { $in: searchNames }
    });

    const inventoryMap = new Map(inventoryItems.map(item => [item.name.trim().toLowerCase(), item]));

    for (const requestedItem of items) {
        const lookupName = requestedItem.itemName.trim().toLowerCase();
        const dbItem = inventoryMap.get(lookupName);

        if (!dbItem) {
            throw new Error(`Item "${requestedItem.itemName}" not found in your inventory.`);
        }
        if (dbItem.quantity < requestedItem.quantity) {
            throw new Error(`Not enough stock for ${dbItem.name}. Only ${dbItem.quantity} available.`);
        }
    }

    const bulkOps = items.map(item => ({
        updateOne: {
            filter: { userId, name: { $regex: new RegExp(`^${escapeRegex(item.itemName.trim())}$`, 'i') } },
            update: { $inc: { quantity: -item.quantity } }
        }
    }));

    await Inventory.bulkWrite(bulkOps);

    return Inventory.find({ userId, name: { $in: searchNames } });
};

export const updateOrCreateInventoryBulkForUser = async (userId, items) => {
    const escapeRegex = (string) => {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const bulkOps = items.map(item => ({
        updateOne: {
            filter: { userId, name: { $regex: new RegExp(`^${escapeRegex(item.itemName.trim())}$`, 'i') } },
            update: {
                $inc: { quantity: item.quantity },
                $setOnInsert: {
                    name: item.itemName.trim(),
                    description: "Item received from another warehouse.",
                    price: 0,
                    categoryId: "UNCATEGORIZED",
                    userId: userId,
                }
            },
            upsert: true
        }
    }));

    await Inventory.bulkWrite(bulkOps);

    const itemNames = items.map(item => new RegExp(`^${escapeRegex(item.itemName.trim())}$`, 'i'));
    return Inventory.find({ userId, name: { $in: itemNames } });
};

export const adjustInventoryQuantityForUser = async (userId, itemName, quantityChange) => {
    const item = await Inventory.findOne({ userId, name: { $regex: new RegExp(`^${itemName}$`, 'i') } });
    if (!item) {
        throw new Error(`Item "${itemName}" not found for user ${userId} to adjust.`);
    }
    item.quantity += quantityChange;
    if (item.quantity < 0) {
        item.quantity = 0;
    }
    await item.save();
    return item;
};

export const updateOrCreateInventoryForUser = async (userId, itemName, quantity) => {
    const existingItem = await Inventory.findOne({
        userId,
        name: { $regex: new RegExp(`^${itemName}$`, 'i') }
    });

    if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
        return existingItem;
    } else {
        const newItem = await Inventory.create({
            name: itemName,
            description: "Item received from another warehouse.",
            price: 0,
            quantity: quantity,
            categoryId: "UNCATEGORIZED",
            userId: userId,
        });
        return newItem;
    }
};

export const rollbackInventoryForShipmentForUsers = async (senderId, recipientId, items) => {
    const escapeRegex = (string) => {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const senderOps = items.map(item => ({
        updateOne: {
            filter: { userId: senderId, name: { $regex: new RegExp(`^${escapeRegex(item.itemName.trim())}$`, 'i') } },
            update: { $inc: { quantity: item.quantity } }
        }
    }));

    const recipientOps = items.map(item => ({
        updateOne: {
            filter: { userId: recipientId, name: { $regex: new RegExp(`^${escapeRegex(item.itemName.trim())}$`, 'i') } },
            update: { $inc: { quantity: -item.quantity } }
        }
    }));

    await Inventory.bulkWrite([...senderOps, ...recipientOps]);

    return true;
};
