export const typeDefs = `#graphql
  type Inventory {
    id: ID!
    name: String!
    description: String
    price: Float!
    quantity: Int!
    categoryId: ID!
    userId: String!
    createdAt: String
    updatedAt: String
  }

  type InventoryConnection {
    inventories: [Inventory!]!
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type DeletePayload {
    success: Boolean!
    message: String!
  }

  input DecreaseItemInput {
    itemName: String!
    quantity: Int!
  }

  input UpdateOrCreateItemInput {
    itemName: String!
    quantity: Int!
  }

  input RollbackItemInput {
    itemName: String!
    quantity: Int!
  }

  type Query {
    getInventory(id: ID!): Inventory
    getInventoryByName(name: String!): Inventory
    getInventoriesByNames(names: [String!]!): [Inventory]
    getAllInventory(
      search: String
      categoryId: ID
      sortBy: String
      sortOrder: String
      page: Int
      limit: Int
    ): InventoryConnection
    getInventoriesByCategoryIdAndUserId(categoryId: ID!, userId: String!): [Inventory]
  }

  type Mutation {
    createInventory(name: String!, description: String, price: Float!, quantity: Int!, categoryId: ID!): Inventory
    updateInventory(id: ID!, name: String, description: String, price: Float, quantity: Int, categoryId: ID): Inventory
    deleteInventory(id: ID!): DeletePayload!
    decreaseInventory(id: ID!, amount: Int!): Inventory
    decreaseInventoryBulk(items: [DecreaseItemInput!]!): [Inventory]
    updateOrCreateInventoryBulk(userId: String!, items: [UpdateOrCreateItemInput!]!): [Inventory]
    updateOrCreateInventory(userId: String!, itemName: String!, quantity: Int!): Inventory
    adjustInventoryQuantity(userId: String!, itemName: String!, quantityChange: Int!): Inventory
    rollbackInventoryForShipment(senderId: String!, recipientId: String!, items: [RollbackItemInput!]!): Boolean
  }
`;