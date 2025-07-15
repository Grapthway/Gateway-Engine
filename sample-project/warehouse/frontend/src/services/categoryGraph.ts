import { CATEGORY_URL, createAPIWrapper } from './api';

const api = createAPIWrapper(CATEGORY_URL);

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryConnectionDTO {
  categories: CategoryDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GetAllCategoriesDTO {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  description?: string;
}

const GET_ALL_CATEGORIES_QUERY = `
  query GetAllCategories($search: String, $page: Int, $limit: Int) {
    getAllCategories(search: $search, page: $page, limit: $limit) {
      categories {
        id
        name
        description
        createdAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

const GET_CATEGORY_BY_ID_QUERY = `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      name
      description
      userId
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CATEGORY_MUTATION = `
  mutation CreateCategory($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

const UPDATE_CATEGORY_MUTATION = `
  mutation UpdateCategory($id: ID!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

const DELETE_CATEGORY_MUTATION = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;


export async function getAllCategories(variables: GetAllCategoriesDTO): Promise<CategoryConnectionDTO> {
  try {
    const data = await api.graphqlRequest<{ getAllCategories: CategoryConnectionDTO }>(
      GET_ALL_CATEGORIES_QUERY,
      variables
    );
    return data.getAllCategories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
}

export async function getCategoryById(id: string): Promise<CategoryDTO> {
  try {
    const data = await api.graphqlRequest<{ getCategory: CategoryDTO }>(
      GET_CATEGORY_BY_ID_QUERY,
      { id }
    );
    console.log(`Fetched category ${id} successfully.`);
    return data.getCategory;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
}

export async function createCategory(categoryData: CreateCategoryDTO): Promise<CategoryDTO> {
  try {
    const data = await api.graphqlRequest<{ createCategory: CategoryDTO }>(
      CREATE_CATEGORY_MUTATION,
      categoryData
    );
    console.log("Created category successfully:", data.createCategory);
    return data.createCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(categoryData: UpdateCategoryDTO): Promise<CategoryDTO> {
  try {
    const data = await api.graphqlRequest<{ updateCategory: CategoryDTO }>(
      UPDATE_CATEGORY_MUTATION,
      categoryData
    );
    console.log(`Updated category ${categoryData.id} successfully.`);
    return data.updateCategory;
  } catch (error) {
    console.error(`Error updating category ${categoryData.id}:`, error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const data = await api.graphqlRequest<{ deleteCategory: { success: boolean } }>(
      DELETE_CATEGORY_MUTATION,
      { id }
    );
    console.log(`Deleted category ${id} successfully.`);
    return data.deleteCategory.success;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
}
