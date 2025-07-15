import Inventory from '../../models/Inventory.js';

export const deleteInventory = async (id, userId) => {
  const result = await Inventory.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
};