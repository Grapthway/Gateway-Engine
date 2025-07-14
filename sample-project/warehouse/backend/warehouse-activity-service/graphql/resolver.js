import { getUserIdFromContext } from '../utils/auth.js';
import { createRelation, createActivityBulk } from '../services/warehouse/create.js';
import { getRelationById, getAllRelationsForUser, checkRelation, getActivityById, getAllActivitiesForUser } from '../services/warehouse/read.js';
import { deleteRelation } from '../services/warehouse/delete.js';

export const resolvers = {
  Query: {
    getWarehouseRelation: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      return getRelationById(id, userId);
    },
    getAllWarehouseRelations: async (_, args, context) => {
      const userId = getUserIdFromContext(context);
      return getAllRelationsForUser(userId, args);
    },
    checkWarehouseRelation: async (_, { partnerId }, context) => {
        const userId = getUserIdFromContext(context);
        return checkRelation(userId, partnerId);
    },
    getWarehouseActivity: async (_, { id }, context) => {
        const userId = getUserIdFromContext(context);
        return getActivityById(id, userId);
    },
    getAllWarehouseActivities: async (_, args, context) => {
        const userId = getUserIdFromContext(context);
        return getAllActivitiesForUser(userId, args);
    }
  },
  Mutation: {
    createWarehouseRelation: async (_, args, context) => {
      const owner = context?.user;
      const partner = context?.partner;

      if (!owner || !owner.id || !owner.email) {
          throw new Error("Owner could not be identified or email is missing.");
      }
      if (!partner || !partner.id || !partner.email) {
          throw new Error("Partner user could not be found or verified.");
      }

      return createRelation(owner.id, owner.email, partner.id, partner.email);
    },
    deleteWarehouseRelation: async (_, { id }, context) => {
      const userId = getUserIdFromContext(context);
      return deleteRelation(id, userId);
    },
    createWarehouseActivityBulk: async (_, args) => {
        return createActivityBulk(args);
    }
  },
  WarehouseRelation: {
    partnerId: (parent, _, context) => {
      const viewerId = getUserIdFromContext(context);
      return parent.ownerId === viewerId ? parent.partnerId : parent.ownerId;
    },
    partnerEmail: (parent, _, context) => {
      const viewerId = getUserIdFromContext(context);
      return parent.ownerId === viewerId ? parent.partnerEmail : parent.ownerEmail;
    }
  }
};