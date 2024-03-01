import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// To bring in the contents of schema.graphql, we'll need some additional imports.
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

// To enable mocked data, we'll need to use two new packages: @graphql-tools/mock and @graphql-tools/schema.
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

const mocks = {
  Query: () => ({
    featuredPlaylists: () => [...new Array(6)],
  }),
  Playlist: () => ({
    id: () => "playlist_01",
    name: () => "Groovin' with GraphQL",
    description: () =>
      "Serving up the hottest development hits, Groovin' with GraphQL has everything you need to get into the coding mindspace... and stay there!",
  }),
};

async function startApolloServer() {
  // Note: We're using shorthand property notation with implied keys, because we've named our constant with the matching key (typeDefs)
  const server = new ApolloServer({   schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs }),
    mocks,
  }), });

  // The startStandaloneServer function returns a Promise, so we'll await the results of that call, and pull out the url property from the result.
  const { url } = await startStandaloneServer(server);

  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);

}

startApolloServer();
