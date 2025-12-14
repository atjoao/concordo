import mongoose from "mongoose";

const Emailchange = mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    key: { type: String, required: true },
    email_change_to: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    expIn: { type: Date, default: Date.now, expires: 3600 },
});

export default mongoose.model("EmailChange", Emailchange);
