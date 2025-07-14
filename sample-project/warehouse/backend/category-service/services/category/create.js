import Category from '../../models/Category.js';

export const createCategory = async (args, userId) => {
  const { name, description } = args;
  const newCategory = await Category.create({
    name,
    description,
    userId
  });
  return newCategory;
};