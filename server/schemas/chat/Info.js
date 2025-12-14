import mongoose from "mongoose";

/**
 * @description Database model para criar um chat
 *
 * @returns {Model}
 */
const Info = (chat_id) => {
    const db = mongoose.connection.useDb(`chat-${chat_id}`);

    const Info = mongoose.Schema(
        {
            members_id: { type: Array, default: [], required: true },
            chatType: { type: String, default: "PM" }, // (PM || GP)
            // grupos (GP)
            chatName: { type: String, default: "" },
            chatAvatar: { type: String, default: "default" },
            chatOwnerId: { type: String, default: "" },
            infodoc: { type: Boolean, default: true },
        },
        { timestamps: true }
    );

    return db.model("Info", Info);
};

export default Info;
