import Category from '../../models/Category.js';

export const updateCategory = async (args, userId) => {
  const { id, name, description } = args;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  const updatedCategory = await Category.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true }
  );

  return updatedCategory;
};