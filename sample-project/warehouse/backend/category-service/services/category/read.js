import Category from '../../models/Category.js';

export const getCategoryById = async (id, userId) => {
  return Category.findOne({ _id: id, userId });
};

export const getAllCategoriesForUser = async (userId, { search, page = 1, limit = 4 }) => {
  const query = { userId };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const totalItems = await Category.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const categories = await Category.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .exec();

  return {
    categories,
    totalItems,
    totalPages,
    currentPage: page,
  };
};