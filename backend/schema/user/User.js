import mongoose from "mongoose";
const User = mongoose.Schema({
    username: { type: String, required: true, unique: false, min: 4, max: 20 },
    descrim: {
        type: String,
        default: function () {
            const currentTime = new Date();
            const seed = currentTime.getTime();
            const random = Math.floor(Math.random() * 10000);
            let seededRandomNumber = (seed + random) % 10000;

            if (seededRandomNumber < 1000) {
                seededRandomNumber += 1000;
            }

            return String(seededRandomNumber);
        },
    },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    criadoem: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    avatar: { type: String, default: "default" },

    block_list: { type: Array, default: [] },

    chats: { type: Array, default: [] },

    // nao fiz isto
    last_read_messages: new mongoose.Schema({
        chat_id: { type: Object },
        message_id: { type: Object },
    }),

    friends: { type: Array, default: [] },
    friend_requests: { type: Array, default: [] },
    friend_sent_request: { type: Array, default: [] },
});

export default mongoose.model("User", User);
