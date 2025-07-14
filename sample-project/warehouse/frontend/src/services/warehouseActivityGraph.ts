import { WAREHOUSE_ACTIVITY_URL, createAPIWrapper } from './api';

const api = createAPIWrapper(WAREHOUSE_ACTIVITY_URL);


export interface WarehouseRelationDTO {
  id: string;
  ownerId: string;
  partnerId: string;
  partnerEmail: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRelationConnectionDTO {
  relations: WarehouseRelationDTO[];
  totalItems: number;
}

export interface WarehouseActivityDTO {
  id: string;
  shippingId: string;
  userId: string;
  activityType: 'SENT' | 'RECEIVED' | 'UPDATED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
}

export interface WarehouseActivityConnectionDTO {
  activities: WarehouseActivityDTO[];
  totalItems: number;
}


const GET_ALL_WAREHOUSE_RELATIONS_QUERY = `
  query GetAllWarehouseRelations($search: String, $page: Int, $limit: Int) {
    getAllWarehouseRelations(search: $search, page: $page, limit: $limit) {
      relations {
        id
        partnerId
        partnerEmail
        status
        createdAt
      }
      totalItems
    }
  }
`;

const GET_ALL_WAREHOUSE_ACTIVITIES_QUERY = `
  query GetAllWarehouseActivities($page: Int, $limit: Int) {
    getAllWarehouseActivities(page: $page, limit: $limit) {
      activities {
        id
        shippingId
        activityType
        notes
        createdAt
      }
      totalItems
    }
  }
`;


const CREATE_WAREHOUSE_RELATION_MUTATION = `
  mutation CreateWarehouseRelation($partnerEmail: String!) {
    createWarehouseRelation(partnerEmail: $partnerEmail) {
      id
      partnerId
      partnerEmail
      status
    }
  }
`;

const DELETE_WAREHOUSE_RELATION_MUTATION = `
  mutation DeleteWarehouseRelation($id: ID!) {
    deleteWarehouseRelation(id: $id)
  }
`;


export async function getAllWarehouseRelations(variables: { search?: string; page?: number; limit?: number }): Promise<WarehouseRelationConnectionDTO> {
  try {
    const data = await api.graphqlRequest<{ getAllWarehouseRelations: WarehouseRelationConnectionDTO }>(
      GET_ALL_WAREHOUSE_RELATIONS_QUERY,
      variables
    );
    return data.getAllWarehouseRelations;
  } catch (error) {
    console.error("Error fetching warehouse relations:", error);
    throw error;
  }
}

export async function createWarehouseRelation(partnerEmail: string): Promise<WarehouseRelationDTO> {
  try {
    const data = await api.graphqlRequest<{ createWarehouseRelation: WarehouseRelationDTO }>(
      CREATE_WAREHOUSE_RELATION_MUTATION,
      { partnerEmail }
    );
    return data.createWarehouseRelation;
  } catch (error) {
    console.error("Error creating warehouse relation:", error);
    throw error;
  }
}

export async function deleteWarehouseRelation(id: string): Promise<boolean> {
  try {
    const data = await api.graphqlRequest<{ deleteWarehouseRelation: boolean }>(
      DELETE_WAREHOUSE_RELATION_MUTATION,
      { id }
    );
    return data.deleteWarehouseRelation;
  } catch (error) {
    console.error(`Error deleting warehouse relation ${id}:`, error);
    throw error;
  }
}

export async function getAllWarehouseActivities(variables: { page?: number; limit?: number }): Promise<WarehouseActivityConnectionDTO> {
  try {
    const data = await api.graphqlRequest<{ getAllWarehouseActivities: WarehouseActivityConnectionDTO }>(
      GET_ALL_WAREHOUSE_ACTIVITIES_QUERY,
      variables
    );
    return data.getAllWarehouseActivities;
  } catch (error) {
    console.error("Error fetching warehouse activities:", error);
    throw error;
  }
}
