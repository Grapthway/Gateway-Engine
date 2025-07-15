import Inventory from '../../models/Inventory.js';

export const getInventoryById = async (id, userId) => {
  return Inventory.findOne({ _id: id, userId });
};

export const getInventoryByNameForUser = async (name, userId) => {
    return Inventory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, userId });
};

export const getInventoriesByNamesForUser = async (names, userId) => {
    const searchNames = names.map(name => new RegExp(`^${name}$`, 'i'));
    return Inventory.find({
        userId,
        name: { $in: searchNames }
    });
};

export const getAllInventoryForUser = async (userId, { search, categoryId, sortBy, sortOrder, page = 1, limit = 4 }) => {
  // Validate the incoming string arguments.
  const allowedSortBy = ['NAME', 'QUANTITY'];
  const allowedSortOrder = ['ASC', 'DESC'];

  if (sortBy && !allowedSortBy.includes(sortBy)) {
    throw new Error(`Invalid sortBy value. Allowed values are: ${allowedSortBy.join(', ')}`);
  }
  if (sortOrder && !allowedSortOrder.includes(sortOrder)) {
    throw new Error(`Invalid sortOrder value. Allowed values are: ${allowedSortOrder.join(', ')}`);
  }

  const query = { userId };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }

  const sortOptions = {};
  if (sortBy) {
    const sortField = sortBy === 'NAME' ? 'name' : 'quantity';
    const order = sortOrder === 'DESC' ? -1 : 1;
    sortOptions[sortField] = order;
  } else {
    sortOptions.createdAt = -1; // Default sort
  }

  const totalItems = await Inventory.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const inventories = await Inventory.find(query)
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

  return {
    inventories,
    totalItems,
    totalPages,
    currentPage: page,
  };
};

export const getInventoryByCategoryIdAndUserId = async (categoryId, userId) => {
    return Inventory.find({ categoryId, userId });
};