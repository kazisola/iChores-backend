import { createToken, type GraphQLContext } from "./context.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export const userTypeDefs = /* GraphQL */ `
        # SCALARS
        scalar DateTime

        # TYPES
        type User {
            id: ID!
            name: String!
            email: String!
            password: String!
            householdId: ID
            createdAt: DateTime!
        }
        type AuthPayload {
            token: String!
            user: User!
        }

        # INPUTS
        input SignUpInput {
            email: String!
            name: String!
            password: String!
        }
        input SignInInput {
            email: String!
            password: String!
        }

        # QUERIES
        type Query {
            user: User!
        }

        # MUTATIONS
        type Mutation {
            signUp(input: SignUpInput!): AuthPayload!
            signIn(input: SignInInput!): AuthPayload!
        }
`

export const userResolvers = {
    // CUSTOM SCALAR
    // We defined a custom "DateTime" scalar in typeDefs. Here we tell GraphQL how to serialize/deserialize it.
    DateTime: {
        serialize: (value: Date | string) => new Date(value).toISOString(),
        parseValue: (value: string) => new Date(value),
    },
    Query: {
        user: (_: unknown, args: unknown, context: GraphQLContext) => {
            if (!context.currentUser) return null;
            return context.currentUser;
        }
    },
    Mutation: {
        signUp: async (_: unknown, args: { input: { email: string, name: string, password: string } }) => {
            const { email, name, password } = args.input || {};
            const exists = await User.findOne({ email: email.toLowerCase() });
            if (exists) throw new Error("An account with this email already exists!");

            const salt = await bcrypt.genSalt(10);
            const hashed_password = await bcrypt.hash(password, salt);

            const user = await User.create({ email, name, password: hashed_password });

            const token = createToken(user?._id.toString());

            return { user, token }
        },
        signIn: async (_: unknown, args: { input: { email: string, password: string } }) => {
            const { email, password } = args.input || {};
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) throw new Error("User or password does not match!");

            const isValid = await user.comparePassword(password);
            if (!isValid) throw new Error("User or password does not match!");

            const token = createToken(user?._id.toString());

            return { token, user }
        }
    }
}