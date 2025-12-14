import mongoose from "mongoose";

export const stats = mongoose.Schema({
    messages: { type: Number, default: 0 },
    created_users: { type: Number, default: 0 },
    warns: { type: Number, default: 0 },
    date: { type: Date },
});

export default mongoose.model("stat", stats);
