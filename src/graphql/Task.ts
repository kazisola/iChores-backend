import type mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { requireAuth, type GraphQLContext } from "./context.js"
import { Room } from "../models/Room.js";

export const taskTypeDefs = /* GraphQL */ `
    scalar DateTime
    enum RecurType {
        one_time 
        daily
        weekly
        bi_weekly
        monthly
        quarterly
        yearly
    }
    enum Urgency {
        red
        yellow
        green
    }
    type Task {
        id: ID!
        roomId: ID!
        householdId: ID!
        title: String!
        dueDate: DateTime
        recur: RecurType
        assigneeName: String!
        isCompleted: Boolean!
        completedAt: DateTime
        completedBy: String
        createdAt: DateTime
        updatedAt: DateTime
        urgency: Urgency!
    }
    type Query {
        myTasks(roomId: ID): [Task!]!
    }
    type Mutation {
        createTask(input: CreateTaskInput): Task!
        completeTask(input: CompleteTaskInput): MutationResponse!
        removeTask(taskId: String): MutationResponse!
    }
    input CreateTaskInput {
        roomId: ID!
        title: String!
        dueDate: DateTime
        recur: RecurType
        assigneeName: String!
    }
    input CompleteTaskInput {
        taskId: ID!
        completedBy: String!
    }
    type MutationResponse {
        success: Boolean!,
        message: String!
    }
`

export const taskResolvers = {
    DateTime: {
        serialize: (value: Date | string) => new Date(value).toISOString(),
        parseValue: (value: string) => new Date(value),
    },
    Query: {
        myTasks: async (_: unknown, args: { roomId?: string }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if (!user.householdId) return [];
            const filter: { householdId: mongoose.Types.ObjectId, roomId?: string, isCompleted: boolean } = {
                householdId: user.householdId,
                isCompleted: false
            }
            if (args.roomId) filter.roomId = args.roomId;
            return await Task.find(filter).sort({ dueDate: 1 });
        }
    },
    Mutation: {
        createTask: async (_: unknown, args: { input: { roomId: string, title: string, dueDate: Date, recur: string, assigneeName: string } }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if (!user.householdId) throw new Error("No household found! You can't create task yet.");

            const room = await Room.findOne({ _id: args.input.roomId, householdId: user.householdId });
            if (!room) throw new Error("Room not found!");

            return await Task.create({
                householdId: user.householdId,
                ...args.input
            })
        },
        completeTask: async (_: unknown, args: { input: { taskId: string, completedBy: string } }, context: GraphQLContext ) => {
            const user = requireAuth(context);
            if(!user.householdId) throw new Error("No household found!");
            const task = await Task.findOneAndUpdate(
                { _id: args.input.taskId, householdId: user.householdId },
                {
                    completedBy: args.input.completedBy,
                    isCompleted: true,
                    completedAt: new Date()
                }
            )
            if(!task) throw new Error("No task were found!");
            await task.save();
            return { success: true, message: "Task were completed!" }
        },
        removeTask: async (_: unknown, args: { taskId: string }, context: GraphQLContext) => {
            const user = requireAuth(context);
            if(!user.householdId) throw new Error("No household found!")
            await Task.findOneAndDelete({_id: args.taskId, householdId: user.householdId});
            return { success: true, message: "Deleted task successfully!" }
        }
    }
}