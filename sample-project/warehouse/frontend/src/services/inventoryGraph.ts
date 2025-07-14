import { createAPIWrapper, INVENTORY_URL } from './api';

const api = createAPIWrapper(INVENTORY_URL);

export interface InventoryDTO {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryConnectionDTO {
  inventories: InventoryDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GetAllInventoryDTO {
  search?: string;
  categoryId?: string;
  sortBy?: 'NAME' | 'QUANTITY';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateInventoryDTO {
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
  description?: string;
}

export interface UpdateInventoryDTO {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  categoryId?: string;
  description?: string;
}

const GET_ALL_INVENTORY_QUERY = `
  query GetAllInventory(
    $search: String,
    $categoryId: ID,
    $sortBy: String,
    $sortOrder: String,
    $page: Int,
    $limit: Int
  ) {
    getAllInventory(
      search: $search,
      categoryId: $categoryId,
      sortBy: $sortBy,
      sortOrder: $sortOrder,
      page: $page,
      limit: $limit
    ) {
      inventories {
        id
        name
        description
        price
        quantity
        categoryId
        createdAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

const CREATE_INVENTORY_MUTATION = `
  mutation CreateInventory(
    $name: String!, 
    $price: Float!, 
    $quantity: Int!, 
    $categoryId: ID!, 
    $description: String
  ) {
    createInventory(
      name: $name, 
      price: $price, 
      quantity: $quantity, 
      categoryId: $categoryId, 
      description: $description
    ) {
      id
    }
  }
`;

const UPDATE_INVENTORY_MUTATION = `
  mutation UpdateInventory(
    $id: ID!, 
    $name: String, 
    $price: Float, 
    $quantity: Int, 
    $categoryId: ID, 
    $description: String
  ) {
    updateInventory(
      id: $id, 
      name: $name, 
      price: $price, 
      quantity: $quantity, 
      categoryId: $categoryId, 
      description: $description
    ) {
      id
      name
      price
      quantity
    }
  }
`;

const DELETE_INVENTORY_MUTATION = `
  mutation DeleteInventory($id: ID!) {
    deleteInventory(id: $id) {
      success
      message
    }
  }
`;


export async function getAllInventory(variables: GetAllInventoryDTO): Promise<InventoryConnectionDTO> {
  try {
    const data = await api.graphqlRequest<{ getAllInventory: InventoryConnectionDTO }>(
      GET_ALL_INVENTORY_QUERY,
      variables
    );
    return data.getAllInventory;
  } catch (error) {
    console.error("Error fetching all inventory:", error);
    throw error;
  }
}

export async function createInventory(inventoryData: CreateInventoryDTO): Promise<{id: string}> {
  try {
    const data = await api.graphqlRequest<{ createInventory: {id: string} }>(
      CREATE_INVENTORY_MUTATION,
      inventoryData
    );
    return data.createInventory;
  } catch (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }
}

export async function updateInventory(inventoryData: UpdateInventoryDTO): Promise<InventoryDTO> {
  try {
    const data = await api.graphqlRequest<{ updateInventory: InventoryDTO }>(
      UPDATE_INVENTORY_MUTATION,
      inventoryData
    );
    console.log(`Updated inventory item ${inventoryData.id} successfully.`);
    return data.updateInventory;
  } catch (error) {
    console.error(`Error updating inventory item ${inventoryData.id}:`, error);
    throw error;
  }
}

export async function deleteInventory(id: string): Promise<boolean> {
  try {
    const data = await api.graphqlRequest<{ deleteInventory: { success: boolean } }>(
      DELETE_INVENTORY_MUTATION,
      { id }
    );
    return data.deleteInventory.success;
  } catch (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
}
