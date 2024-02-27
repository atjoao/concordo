import mongoose from "mongoose";

const Message = (chat_id) => {
    const db = mongoose.connection.useDb(`chat-${chat_id}`);

    const Message = mongoose.Schema(
        {
            user_id: { type: Object, required: true },
            content: { type: String },

            filesAnexed: { type: Array, default: [] },
            type: { type: String, default: "Message" },
        },
        { timestamps: true }
    );

    return db.model("Message", Message);
};

export default Message;
