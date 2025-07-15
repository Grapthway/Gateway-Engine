import { getUserIdFromContext } from '../utils/auth.js';
import { createShipping } from '../services/shipping/create.js';
import { getShippingById, getAllShippingsForUser } from '../services/shipping/read.js';
import { updateShipping } from '../services/shipping/update.js';
import { deleteShipping } from '../services/shipping/delete.js';

export const resolvers = {
  Query: {
    getShipping: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      return getShippingById(id, userId);
    },
    getAllShippings: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return getAllShippingsForUser(userId, args);
    },
  },
  Mutation: {
    createShipping: async (_, args, context) => {
      const senderId = getUserIdFromContext(context);
      // The recipient user object is expected to be in the context from the pipeline
      const recipient = context?.recipient;
       if (!recipient || !recipient.id || !recipient.name) {
          throw new Error("Recipient user could not be verified.");
      }
      return createShipping(args, senderId, recipient);
    },
    updateShipping: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return updateShipping(args, userId);
    },
    deleteShipping: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context); // Or however you get the user
      
      const wasDeleted = await deleteShipping(id, userId);
      
      if (!wasDeleted) {
        throw new Error("Shipping not found or you don't have permission to delete it.");
      }

      return { 
        success: true,
        message: 'Shipping deleted successfully.' 
      };
    },

  },
};