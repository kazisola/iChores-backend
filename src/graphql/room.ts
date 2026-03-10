import { Room } from "../models/Room.js";
import { requireAuth, type GraphQLContext } from "./context.js"

export const roomTypeDefs = /* GraphQL */ `
    scalar DateTime 
    enum RoomType {
        living
        kitchen
        master
        bedroom
        bathroom
        garage
        laundry
        office
        dining
        backyard
    }
    type RoomPosition {
        x: Int!
        y: Int!
        w: Int!
        h: Int!
    }
    type Room {
        householdId: ID!
        type: RoomType!
        position: RoomPosition!
        name: String!,
        label: String!,
        icon: String!,
        color: String!,
        createdAt: DateTime,
        updatedAt: DateTime
    }
    type Query {
        myRooms: Room!
    }
`

export const roomResolvers = {
    // CUSTOM SCALAR
    // We defined a custom "DateTime" scalar in typeDefs. Here we tell GraphQL how to serialize/deserialize it.
    DateTime: {
        serialize: (value: Date | string) => new Date(value).toISOString(),
        parseValue: (value: string) => new Date(value),
    },
    Query: {
        myRooms: async (_: unknown, __: unknown, context: GraphQLContext) => {
            const user = requireAuth(context);
            console.log("user:", user);
            if (!user.householdId) return [];
            return await Room.find({ householdId: user.householdId });
        }
    }
}