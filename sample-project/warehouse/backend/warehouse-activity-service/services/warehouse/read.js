import WarehouseRelation from '../../models/WarehouseRelation.js';
import WarehouseActivity from '../../models/WarehouseActivity.js';

export const getRelationById = async (id, ownerId) => {
  return WarehouseRelation.findOne({ _id: id, ownerId });
};

export const getAllRelationsForUser = async (userId, { search, page = 1, limit = 10 }) => {

    const query = {
        $or: [
            { ownerId: userId },
            { partnerId: userId }
        ]
    };

    if (search) {

      query.partnerEmail = { $regex: search, $options: 'i' };
    }

    const totalItems = await WarehouseRelation.countDocuments(query);
    const relations = await WarehouseRelation.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

    return { relations, totalItems };
};

export const checkRelation = async (userId1, userId2) => {
    return WarehouseRelation.findOne({
        $or: [
            { ownerId: userId1, partnerId: userId2 },
            { ownerId: userId2, partnerId: userId1 }
        ],
        status: 'ACTIVE'
    });
};


export const getActivityById = async (id, userId) => {
    return WarehouseActivity.findOne({ _id: id, userId });
};

export const getAllActivitiesForUser = async (userId, { page = 1, limit = 10 }) => {
    const query = { userId };
    const totalItems = await WarehouseActivity.countDocuments(query);
    const activities = await WarehouseActivity.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

    return { activities, totalItems };
};