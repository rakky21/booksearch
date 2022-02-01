const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    books: [Book]
  }

  type Book {
    bookId: ID
    authors: [String]
    description: String
    title: String
    link: String
    image: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    removeBook(bookId: ID): User
    saveBook(bookId: ID,authors: [String],description: String,title: String,link: String,image: String): User
  }
`;

module.exports = typeDefs;
