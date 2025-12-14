import mongoose from "mongoose";

export const Chat = mongoose.Schema(
    {
        chat_id: { type: String, required: true },
        members: { type: Array },
    },
    { timestamps: true }
);

export default mongoose.model("chat", Chat);
