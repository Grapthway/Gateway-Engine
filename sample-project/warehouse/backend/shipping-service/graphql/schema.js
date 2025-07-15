export const typeDefs = `#graphql
  type ShippingItem {
    name: String!
    quantity: Int!
  }

  type Shipping {
    id: ID!
    items: [ShippingItem!]!
    address: String!
    phoneNumber: String!
    recipientName: String!
    senderId: String!
    recipientId: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type ShippingConnection {
    shippings: [Shipping!]!
    totalItems: Int!
  }

  # NEW: A dedicated response type for deletion mutations.
  type DeletePayload {
    success: Boolean!
    message: String!
  }

  input ShippingItemInput {
    itemName: String!
    quantity: Int!
  }

  input CreateShippingInput {
    items: [ShippingItemInput!]!  # Ensure array type
    address: String!
    phoneNumber: String!
    recipientEmail: String!
  }
  
  input UpdateShippingInput {
    id: ID!
    items: [ShippingItemInput!]
    address: String
    phoneNumber: String
  }

  enum ShippingType {
    DELIVERY
    ARRIVED
  }

  type Query {
    getShipping(id: ID!): Shipping
    getAllShippings(
        type: ShippingType!, 
        startDate: String, 
        endDate: String, 
        page: Int, 
        limit: Int
    ): ShippingConnection
  }

  type Mutation {
    createShipping(input: CreateShippingInput!): Shipping
    updateShipping(input: UpdateShippingInput!): Shipping
    # REVISED: The deleteShipping mutation now returns the new payload object.
    deleteShipping(id: ID!): DeletePayload!
  }
`;