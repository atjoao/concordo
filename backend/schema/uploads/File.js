import mongoose from "mongoose";
import { customAlphabet } from "nanoid/async";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export const File = mongoose.Schema(
    {
        fileName: { type: String, default: await nanoid() },
        chat_id: { type: String },
        path: { type: String },
        uploadedBy: { type: Object, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("file", File);
