import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context.js";
import { userResolvers, userTypeDefs as User } from "./user.js";
import _ from "lodash"
import { householdResolvers, householdTypeDefs as Household } from "./household.js";
import { roomTypeDefs as Room, roomResolvers } from "./room.js";

export const schema = createSchema<GraphQLContext>({
    typeDefs: [User, Household, Room],
    resolvers: _.merge(userResolvers, householdResolvers, roomResolvers)
})