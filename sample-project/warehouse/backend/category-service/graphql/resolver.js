import { getUserIdFromContext } from '../utils/auth.js';
import { createCategory } from '../services/category/create.js';
import { getCategoryById, getAllCategoriesForUser } from '../services/category/read.js';
import { updateCategory } from '../services/category/update.js';
import { deleteCategory } from '../services/category/delete.js';

export const resolvers = {
  Query: {
    getCategory: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      return getCategoryById(id, userId);
    },
    // UPDATED: Resolver now passes args to the service layer.
    getAllCategories: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return getAllCategoriesForUser(userId, args);
    },
  },
  Mutation: {
    createCategory: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return createCategory(args, userId);
    },
    updateCategory: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      const updated = await updateCategory(args, userId);
      if (!updated) {
        throw new Error("Category not found or you don't have permission to edit it.");
      }
      return updated;
    },
    deleteCategory: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      const wasDeleted = await deleteCategory(id, userId);
      if (!wasDeleted) {
          throw new Error("Category not found or you don't have permission to delete it.");
      }
      return {
        success: wasDeleted,
        message: "Category deleted successfully."
      };
    },
  },
};