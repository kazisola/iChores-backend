import mongoose, { Document, Schema } from "mongoose";

export type RoomType = | "living" | "kitchen" | "master" | "bedroom" | "bathroom" | "garage" | "laundry" | "office" | "dining" | "backyard";

export interface IRoomPosition {
    x: number,
    y: number,
    w: number,
    h: number
}

export interface IRoom extends Document {
    householdId: mongoose.Types.ObjectId,
    type: RoomType,
    position: IRoomPosition,
    name: string,
    label: string,
    icon: string,
    color: string,
    createdAt: Date,
    updatedAt: Date
}

const RoomPositionSchema = new Schema<IRoomPosition>({
    x: { type: Number, default: 80 },
    y: { type: Number, default: 80 },
    w: { type: Number, default: 160 },
    h: { type: Number, default: 120 }
})

const RoomSchema = new Schema<IRoom>({
    householdId: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["living","kitchen","master","bedroom","bathroom","garage","laundry","office","dining","backyard"],
        required: true
    },
    position: {
        type: RoomPositionSchema,
        default: () => ({ x: 80, y: 80, w: 160, h: 120 })
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "1a1916"
    }
}, { timestamps: true });

export const Room = mongoose.model<IRoom>("Room", RoomSchema);