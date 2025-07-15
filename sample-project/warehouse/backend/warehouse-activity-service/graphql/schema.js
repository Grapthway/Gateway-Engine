export const typeDefs = `#graphql
  type WarehouseRelation {
    id: ID!
    ownerId: String!
    partnerId: String!
    partnerEmail: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type WarehouseRelationConnection {
    relations: [WarehouseRelation!]!
    totalItems: Int!
  }

  type WarehouseActivity {
    id: ID!
    shippingId: String!
    userId: String!
    activityType: String! # e.g., SENT, RECEIVED, CANCELLED
    notes: String
    createdAt: String
  }

  type WarehouseActivityConnection {
    activities: [WarehouseActivity!]!
    totalItems: Int!
  }

  input ActivityItemInput {
    itemName: String!
    quantity: Int!
  }

  type Query {
    getWarehouseRelation(id: ID!): WarehouseRelation

    getAllWarehouseRelations(search: String, page: Int, limit: Int): WarehouseRelationConnection
    checkWarehouseRelation(partnerId: String!): WarehouseRelation

    getWarehouseActivity(id: ID!): WarehouseActivity
    getAllWarehouseActivities(page: Int, limit: Int): WarehouseActivityConnection
  }

  type Mutation {
    createWarehouseRelation(partnerEmail: String!): WarehouseRelation

    deleteWarehouseRelation(id: ID!): Boolean

    createWarehouseActivityBulk(
        shippingId: String!,
        senderId: String!,
        recipientId: String!,
        senderName: String!,
        recipientName: String!,
        items: [ActivityItemInput!]!, 
        activityType: String!
    ): Boolean
  }
`;
