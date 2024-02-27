import mongoose from "mongoose";

const User = mongoose.Schema({
    username: { type: String, required: true, unique: false, min: 4, max: 20 },
    descrim: { type: Number, default: Math.floor(1000 + Math.random() * 9000) },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    criadoem: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    avatar: { type: String, default: "default" },

    block_list: { type: Array, default: [] },

    chats: { type: Array, default: [] },

    last_read_messages: new mongoose.Schema({
        chat_id: { type: Object },
        message_id: { type: Object },
    }),

    friends: { type: Array, default: [] },
    friend_requests: { type: Array, default: [] },
    friend_sent_request: { type: Array, default: [] },
});

export default mongoose.model("User", User);
