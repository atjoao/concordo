import mongoose, { Model } from "mongoose";

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

export const checkChatDbExists = async (chat_id) => {
    try {
        const dbList = await mongoose.connection.db.admin().listDatabases();
        const dbListMap = dbList.databases.map((db) => db.name);

        return dbListMap.includes(`chat-${chat_id}`);
    } catch (error) {
        console.error("ERRO AO VERIFICAR DATABASES EXISTENTES");
        return false;
    }
};

export default Info;
