import mongoose from "mongoose";
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
        id: ID!
        householdId: ID!
        type: RoomType!
        position: RoomPosition!
        label: String!
        icon: String!
        color: String!
        createdAt: DateTime
        updatedAt: DateTime
    }
    type Query {
        myRooms: [Room!]!
    }


    input RoomPositionInput {
        x: Int!
        y: Int!
        w: Int!
        h: Int!
    }
    input UpdateRoomPositionInput {
        roomId: ID!
        x: Int!
        y: Int!
        w: Int!
        h: Int!
    }
    input UpdateRoomLabelInput {
        roomId: ID!
        lbale: String!
    }
    input AddRoomInput {
        type: String!
        label: String!
        icon: String!
        color: String!
        position: RoomPositionInput!
    }

    type Mutation {
        addRoom(input: AddRoomInput): Room!
        removeRoom(id: String): MutationResponse!
    }
    type MutationResponse {
        success: Boolean!
        message: String!
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
            if (!user.householdId) return [];
            const rooms = await Room.find({ householdId: user.householdId });
            return rooms;
        }
    },
    Mutation: {
        addRoom: async (_: unknown, args: { input: { type: string, label: string, icon: string, color: string, position: { x: number, y: number, w: number, h: number } } }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if(!user.householdId) throw new Error ("Create household first!")
            const { type, label, icon, color, position } = args.input || {};

            const room = await Room.create({
                householdId: user.householdId,
                type,
                label,
                icon,
                color,
                position
            });
            return room;
        },
        removeRoom: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if(!user.householdId) throw new Error("No household found!")
            
            const room = await Room.findOneAndDelete(
                { _id: args.id, householdId: user.householdId }
            )
            if(!room) throw new Error("Room wasn't found!")

            return { success: true, message: "Room was removed successfully!" };
        }
    }
}