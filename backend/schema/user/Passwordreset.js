import mongoose from "mongoose";

const passwordReset = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        key: { type: String, required: true },
        expIn: { type: Date, default: Date.now, expires: 3600 },
    },
    { timestamps: true }
);

export default mongoose.model("passwordReset", passwordReset);
