import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// To bring in the contents of schema.graphql, we'll need some additional imports.
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

// To enable mocked data, we'll need to use two new packages: @graphql-tools/mock and @graphql-tools/schema.
// import { addMocksToSchema } from "@graphql-tools/mock";
// import { makeExecutableSchema } from "@graphql-tools/schema";

import { SpotifyAPI } from "./datasources/spotify-api";
import { resolvers } from "./resolvers";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

// const mocks = {
//   Query: () => ({
//     featuredPlaylists: () => [...new Array(6)],
//   }),
//   Playlist: () => ({
//     id: () => "playlist_01",
//     name: () => "Groovin' with GraphQL",
//     description: () =>
//       "Serving up the hottest development hits, Groovin' with GraphQL has everything you need to get into the coding mindspace... and stay there!",
//   }),
// };

async function startApolloServer() {
  // Note: We're using shorthand property notation with implied keys, because we've named our constant with the matching key (typeDefs)
  // To learn more about the options that ApolloServer can receive, check out the documentation: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#options
  const server = new ApolloServer({
    //   schema: addMocksToSchema({
    //   schema: makeExecutableSchema({ typeDefs }),
    //   mocks,
    //    }
    // ), 
    typeDefs,
    resolvers,
  });

  // The startStandaloneServer function returns a Promise, so we'll await the results of that call, and pull out the url property from the result.
  const { url } = await startStandaloneServer(server,
    {
      context: async () => {
        const { cache } = server;
        // this object becomes our resolver's contextValue, the third positional argument
        return {
          dataSources: {
            spotifyAPI: new SpotifyAPI({ cache }),
          },
        };
      },
    }
  );

  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);

}

startApolloServer();
