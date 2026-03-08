import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    householdId?: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
    comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minlength: [6, "Password must be shorter than 6 char!"]
    },
    householdId: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        default: null
    }
}, { timestamps: true })

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);