import Category from '../../models/Category.js';

export const deleteCategory = async (id, userId) => {
  const result = await Category.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
};