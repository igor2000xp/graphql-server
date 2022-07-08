import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { SERVER_PORT } from './constants/constants';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { cwd } from 'process';

dotenv.config({ path: resolve(cwd(), '.env') });
const serverPort = Number(process.env.HTTP_PORT) || SERVER_PORT;

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`

type Book {
  title: String
  author: String
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).
type Query {
  books: [Book]
}
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  return new Promise((resolve, reject) => {
    httpServer.listen(port).once('listening', resolve).once('error', reject)
  });
}

async function main() {
  try {
    await listen(serverPort);
    console.log(`🚀 Server started at http://localhost:${serverPort}/graphql`);
  } catch (err) {
    console.error('💀 Error starting the apollo server', err);
  }
}

void main();
