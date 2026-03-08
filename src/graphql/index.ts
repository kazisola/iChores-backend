import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "./context.js";

export const schema = createSchema<GraphQLContext>({
    typeDefs: /* GraphQL */ `
        type Query {
            user: User!
        }
        type User {
            name: String!
            email: String!
            password: String!
            householdId: String
        }
    `,
    resolvers: {
        Query: {
            user: () => {
                return {
                    name: "Kazi",
                    email: "kazi123@gmail.com",
                    password: "123123"
                }
            }
        }
    }
})