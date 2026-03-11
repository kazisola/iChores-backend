import mongoose, { Document, Schema } from "mongoose";

export type RecurType = | "one_time" | "daily" | "weekly" | "bi_weekly" | "monthly" | "quarterly" | "yearly";

export type UrgencyType = | "red" | "yellow" | "green";

export interface ITask extends Document {
    roomId: mongoose.Types.ObjectId,
    householdId: mongoose.Types.ObjectId,
    title: string,
    dueDate?: Date,
    recur: RecurType,
    assigneeName: string,
    isCompleted: boolean,
    completedAt?: Date,
    completedBy?: string,
    createdAt: Date,
    updatedAt: Date
    // ffr... A "virtual", computed on the fly, not stored in DB
    urgency: UrgencyType;
}

const TaskSchema = new Schema<ITask>({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        index: true
    },
    householdId: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, "Task title is required!"],
        trim: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    recur: {
        type: String,
        enum: ["one_time", "daily", "weekly", "bi_weekly", "monthly", "quarterly", "yearly"],
        default: "one_time"
    },
    assigneeName: {
        type: String,
        required: true,
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    completedBy: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
    // ffr... "virtuals: true" means virtual fields are included when dev convert a document to JSON (like sending to the client)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// VIRTUAL FIELD
// Virtuals are computed properties, they're calculated when accessed but NOT stored in MongoDB. Here in our case perfect for urgency since it depends on the current date which changes every day

TaskSchema.virtual("urgency").get(function (): UrgencyType {
    if (!this.dueDate) return "green";
    const diffDays = (this.dueDate.getTime() - Date.now()) / 86400000;
    if (diffDays < 0) return "red";
    if (diffDays <= 3) return "yellow";
    return "green";
});

// POST-SAVE HOOK
// When a recurring task is completed, automatically create the next one.
//"post" hooks run AFTER the operation completes.
TaskSchema.post("save", async function () {
    if (!this.isCompleted || this.recur === "one_time") return;

    const recurMap: Record<string, number> = {
        daily: 1, weekly: 7, "bi_weekly": 14,
        monthly: 30, quarterly: 90, yearly: 365,
    };

    const days = recurMap[this.recur];
    if (!days || !this.dueDate) return;

    const nextDue = new Date(this.dueDate);
    nextDue.setDate(nextDue.getDate() + days);

    // Create the next occurrence
    await Task.create({
        roomId: this.roomId,
        householdId: this.householdId,
        title: this.title,
        dueDate: nextDue,
        recur: this.recur,
        assigneeName: this.assigneeName,
    });
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);