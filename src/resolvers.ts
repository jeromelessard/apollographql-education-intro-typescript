import { Resolvers } from "./types";

// parent:
// parent is the returned value of the resolver for this field's parent. This will be useful when dealing with resolver chains.
// args:
// args is an object that contains all GraphQL arguments that were provided for the field by the GraphQL operation. When querying for a specific item (such as a specific track instead of all tracks), in client-land we'll make a query with an id argument that will be accessible via this args parameter in server-land.
// contextValue:
// contextValue is an object shared across all resolvers that are executing for a particular operation. The resolver needs this argument to share state, like authentication information, a database connection, or in our case the RESTDataSource.
// info:
// info contains information about the operation's execution state, including the field name, the path to the field from the root, and more. It's not used as frequently as the others, but it can be useful for more advanced actions like setting cache policies at the resolver level.

export const resolvers: Resolvers = {
    Query: {
        featuredPlaylists: (_, __, { dataSources }) => {
            return dataSources.spotifyAPI.getFeaturedPlaylists();
        },
        playlist: (_, { id }, { dataSources }) => {
            return dataSources.spotifyAPI.getPlaylist(id);
        },
    },
    Playlist: {
        tracks: ({ tracks }) => {
            const { items = [] } = tracks;
            return items.map(({ track }) => track);
        }
    },
    Track: {
        durationMs: (parent) => parent.duration_ms
    },
    Mutation: {
        addItemsToPlaylist: async (_, { input }, { dataSources }) => {
            try {
                const response = await dataSources.spotifyAPI.addItemsToPlaylist(input);
                if (response.snapshot_id) {
                    // everything succeeds with the mutation
                    return {
                        code: 200,
                        success: true,
                        message: "Tracks added to playlist!",
                        playlistId: response.snapshot_id, // We don't have this value yet
                    };
                } else {
                    throw Error("snapshot_id property not found")
                }
            } catch (err) {
                return {
                    code: 500,
                    success: false,
                    message: `Something went wrong: ${err}`,
                    playlistId: null,
                  };
             }
        },
    },
    AddItemsToPlaylistPayload: {
        playlist: ({ playlistId }, _, { dataSources }) => {
            return dataSources.spotifyAPI.getPlaylist(playlistId);
        },
      },
};

