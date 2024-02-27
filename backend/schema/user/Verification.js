import mongoose from "mongoose";

export const verification = mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    key: { type: String, required: true },
    expIn: { type: Date, default: Date.now, expires: 3600 },
});

export default mongoose.model("verification", verification);
