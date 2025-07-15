import { getUserIdFromContext } from '../utils/auth.js';
import { createInventory } from '../services/inventory/create.js';
import { getInventoryById, getAllInventoryForUser, getInventoryByCategoryIdAndUserId, getInventoryByNameForUser, getInventoriesByNamesForUser,  } from '../services/inventory/read.js';
import { updateInventory, decreaseInventoryForUser, decreaseInventoryBulkForUser, updateOrCreateInventoryForUser, adjustInventoryQuantityForUser, rollbackInventoryForShipmentForUsers, updateOrCreateInventoryBulkForUser } from '../services/inventory/update.js';
import { deleteInventory } from '../services/inventory/delete.js';

export const resolvers = {
  Query: {
    getInventory: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      return getInventoryById(id, userId);
    },
    getInventoryByName: async (_, { name }, context) => {
        const userId = getUserIdFromContext(context);
        return getInventoryByNameForUser(name, userId);
    },
    getInventoriesByNames: async (_, { names }, context) => {
        const userId = getUserIdFromContext(context);
        return getInventoriesByNamesForUser(names, userId);
    },
    getAllInventory: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return getAllInventoryForUser(userId, args);
    },
    getInventoriesByCategoryIdAndUserId: async (_, { categoryId, userId }) => {
        return getInventoryByCategoryIdAndUserId(categoryId, userId);
    }
  },
  Mutation: {
    createInventory: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return createInventory(args, userId);
    },
    updateInventory: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      const updated = await updateInventory(args, userId);
      if (!updated) {
        throw new Error("Inventory not found or you don't have permission to edit it.");
      }
      return updated;
    },
    deleteInventory: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      const wasDeleted = await deleteInventory(id, userId);
      if (!wasDeleted) {
          throw new Error("Inventory not found or you don't have permission to delete it.");
      }
      return {
        success: wasDeleted,
        message: "Inventory item deleted successfully."
      };
    },
    decreaseInventory: async (_, { id, amount }, context) => {
        const userId = getUserIdFromContext(context);
        return decreaseInventoryForUser(id, amount, userId);
    },
    decreaseInventoryBulk: async (_, { items }, context) => {
        const userId = getUserIdFromContext(context);
        return decreaseInventoryBulkForUser(items, userId);
    },
    updateOrCreateInventory: async (_, { userId, itemName, quantity }) => {
        return updateOrCreateInventoryForUser(userId, itemName, quantity);
    },
    updateOrCreateInventoryBulk: async (_, { userId, items }) => {
        return updateOrCreateInventoryBulkForUser(userId, items);
    },
    adjustInventoryQuantity: async (_, { userId, itemName, quantityChange }) => {
        return adjustInventoryQuantityForUser(userId, itemName, quantityChange);
    },
    rollbackInventoryForShipment: async (_, { senderId, recipientId, items }) => {
        return rollbackInventoryForShipmentForUsers(senderId, recipientId, items);
    },
  },
};
