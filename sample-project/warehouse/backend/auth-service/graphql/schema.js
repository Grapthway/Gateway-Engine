export const typeDefs = `#graphql
  type User { 
    id: ID!
    email: String!
    name: String!
    address: String
    postalCode: String
    gender: String
    role: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type UserDataPayload {
    success: Boolean!
    message: String!
    user: User 
  }

  type LogoutPayload {
    success: Boolean!
    message: String!
  }

  type Query {
    users: [User!]!
    getUserData(token: String): UserDataPayload!
    getUserByEmail(email: String!): User
  }

  type Mutation {
    register(
      email: String!
      name: String!
      password: String!
      address: String
      postalCode: String
      gender: String
    ): User!

    login(email: String!, password: String!): AuthPayload!

    # REVISED: The logout mutation now returns the new payload object.
    logout(token: String): LogoutPayload!

    editUser(token: String, input: EditUserInput!): User!
  }

  input EditUserInput {
    name: String
    password: String
    address: String
    postalCode: String
    gender: String
  }
`;