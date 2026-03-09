import { Household } from "../models/Household.js";
import { User } from "../models/User.js";
import { requireAuth, type GraphQLContext } from "./context.js"

export const householdTypeDefs = /* GraphQL */ `
    enum MemberRole {
        owner
        member
    }
    type HouseholdMember {
        userId: ID!
        name: String!
        role: MemberRole!
    }
    type Household {
        id: ID!
        name: String!
        members: [HouseholdMember!]!
        createdBy: ID
    }

    type Query {
        myHousehold: Household
    }

    input CreateHouseholdInput {
        name: String
    }
    input AddMemberInput {
        name: String!
    }

    type Mutation {
        createHousehold(input: CreateHouseholdInput): Household!
        addHouseholdMember(input: AddMemberInput): Household!
    }
`
export const householdResolvers = {
    Query: {
        myHousehold: async (_: unknown, __: unknown, context: GraphQLContext) => {
            const user = requireAuth(context);
            console.log("user:", user)
            if (!user.householdId) return null;
            return await Household.findById(user.householdId);
        }
    },
    Mutation: {
        createHousehold: async (_: unknown, args: { input?: {name?: string} }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if(user.householdId) throw new Error("User already belong to a household!");

            const household = await Household.create({
                name: args.input?.name || "My Home",
                members: [{ userId: user._id, name: user.name, role: "owner" }],
                createdBy: user._id
            })
            
            await User.findByIdAndUpdate(user._id, { householdId: household._id });

            return household;
        },
        addHouseholdMember: async (_: unknown, args: { input: { name: string } }, context: GraphQLContext) => {
            const user = requireAuth(context);

            if(!user.householdId) throw new Error("Create an household first!")
            const household = await Household.findById(user.householdId);
            if(!household) throw new Error("Household doesn't exist!");
            const memberExists = household.members.some(member => member.name.toLowerCase() === args.input?.name.toLowerCase());

            if(!memberExists) throw new Error(`${args.input?.name} already exists!`);

            household.members.push({
                userId: user._id as mongoose.Types.ObjectId,
                name: args.input.name,
                role: "member"
            })

            await household.save();

            return household;
        }
    }
}