import Inventory from '../../models/Inventory.js';


export const createInventory = async (args, userId) => {
  const { name, description, price, quantity, categoryId } = args;

  const newInventory = await Inventory.create({
    name,
    description,
    price,
    quantity,
    categoryId,
    userId
  });
  return newInventory;
};