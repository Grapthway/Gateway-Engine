export const typeDefs = `#graphql
  type Category {
    id: ID!
    name: String!
    description: String
    userId: String!
    createdAt: String
    updatedAt: String
  }

  # NEW: A wrapper type for paginated category results.
  type CategoryConnection {
    categories: [Category!]!
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type DeletePayload {
    success: Boolean!
    message: String!
  }

  type Query {
    getCategory(id: ID!): Category
    # UPDATED: Query now supports searching and pagination.
    getAllCategories(search: String, page: Int, limit: Int): CategoryConnection
  }

  type Mutation {
    createCategory(name: String!, description: String): Category
    updateCategory(id: ID!, name: String, description: String): Category
    deleteCategory(id: ID!): DeletePayload!
  }
`;
