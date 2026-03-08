import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context.js";
import { userResolvers, userTypeDefs } from "./user.js";
import _ from "lodash"

export const schema = createSchema<GraphQLContext>({
    typeDefs: [userTypeDefs],
    resolvers: _.merge(userResolvers)
})