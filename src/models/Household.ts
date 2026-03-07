import mongoose, { Document, Schema } from "mongoose";

export interface IHouseholdMember extends Document {
    userId: mongoose.Types.ObjectId,
    name: string,
    role: "owner" | "member"
}

export interface IHousehold extends Document {
    name: string,
    members: IHouseholdMember[],
    createdBy: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

const HouseholdMemberSchema = new Schema<IHouseholdMember>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "member"],
        default: "member"
    }
}, { _id: false })

const HouseholdSchema = new Schema<IHousehold>({
    name: {
        type: String,
        trim: true,
        default: "My Home"
    },
    members: {
        type: [HouseholdMemberSchema],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Household = mongoose.model<IHousehold>("Household", HouseholdSchema);