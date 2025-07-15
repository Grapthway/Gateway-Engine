import WarehouseRelation from '../../models/WarehouseRelation.js';

export const deleteRelation = async (id, userId) => {
  const result = await WarehouseRelation.deleteOne({
    _id: id,
    $or: [
      { ownerId: userId },
      { partnerId: userId }
    ]
  });

  return result.deletedCount > 0;
};