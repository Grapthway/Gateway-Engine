import { SHIPPING_URL, createAPIWrapper } from './api';

const api = createAPIWrapper(SHIPPING_URL);


export interface ShippingItemDTO {
    name: string;
    quantity: number;
}

export interface ShippingDTO {
  id: string;
  items: ShippingItemDTO[];
  address: string;
  phoneNumber: string;
  recipientName: string;
  senderId: string;
  recipientId: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ShippingConnectionDTO {
  shippings: ShippingDTO[];
  totalItems: number;
}

export interface ShippingItemInput {
    itemName: string;
    quantity: number;
}

export interface CreateShippingInputDTO {
  items: ShippingItemInput[];
  address: string;
  phoneNumber: string;
  recipientEmail: string;
}

export interface UpdateShippingInputDTO {
  id: string;
  items?: ShippingItemInput[];
  address?: string;
  phoneNumber?: string;
}

export interface GetAllShippingsDTO {
    type: 'DELIVERY' | 'ARRIVED';
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}


const GET_ALL_SHIPPINGS_QUERY = `
  query GetAllShippings($type: ShippingType!, $startDate: String, $endDate: String, $page: Int, $limit: Int) {
    getAllShippings(type: $type, startDate: $startDate, endDate: $endDate, page: $page, limit: $limit) {
      shippings {
        id
        items {
          name
          quantity
        }
        recipientName
        status
        createdAt
      }
      totalItems
    }
  }
`;

const GET_SHIPPING_BY_ID_QUERY = `
  query GetShipping($id: ID!) {
    getShipping(id: $id) {
      id
      items {
        name
        quantity
      }
      address
      phoneNumber
      recipientName
      senderId
      recipientId
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SHIPPING_MUTATION = `
  mutation CreateShipping($input: CreateShippingInput!) {
    createShipping(input: $input) {
      id
      status
    }
  }
`;

const UPDATE_SHIPPING_MUTATION = `
  mutation UpdateShipping($input: UpdateShippingInput!) {
    updateShipping(input: $input) {
      id
    }
  }
`;

const DELETE_SHIPPING_MUTATION = `
  mutation DeleteShipping($id: ID!) {
    deleteShipping(id: $id) {
      success
      message
    }
  }
`;


export async function getAllShippings(variables: GetAllShippingsDTO): Promise<ShippingConnectionDTO> {
  try {
    const data = await api.graphqlRequest<{ getAllShippings: ShippingConnectionDTO }>(
      GET_ALL_SHIPPINGS_QUERY,
      variables
    );
    return data.getAllShippings;
  } catch (error) {
    console.error("Error fetching shippings:", error);
    throw error;
  }
}

export async function getShippingById(id: string): Promise<ShippingDTO> {
    try {
      const data = await api.graphqlRequest<{ getShipping: ShippingDTO }>(
        GET_SHIPPING_BY_ID_QUERY,
        { id }
      );
      return data.getShipping;
    } catch (error) {
      console.error(`Error fetching shipping ${id}:`, error);
      throw error;
    }
  }

export async function createShipping(input: CreateShippingInputDTO): Promise<ShippingDTO> {
  try {
    const data = await api.graphqlRequest<{ createShipping: ShippingDTO }>(
      CREATE_SHIPPING_MUTATION,
      { input }
    );
    return data.createShipping;
  } catch (error) {
    console.error("Error creating shipping:", error);
    throw error;
  }
}

export async function updateShipping(input: UpdateShippingInputDTO): Promise<ShippingDTO> {
  try {
    const data = await api.graphqlRequest<{ updateShipping: ShippingDTO }>(
      UPDATE_SHIPPING_MUTATION,
      { input }
    );
    return data.updateShipping;
  } catch (error) {
    console.error(`Error updating shipping ${input.id}:`, error);
    throw error;
  }
}

export async function deleteShipping(id: string): Promise<boolean> {
  try {
    const data = await api.graphqlRequest<{ deleteShipping: { success: boolean, message: string } }>(
      DELETE_SHIPPING_MUTATION,
      { id }
    );
    
    return data.deleteShipping.success;
    
  } catch (error) {
    console.error(`Error deleting shipping ${id}:`, error);
    throw error;
  }
}
