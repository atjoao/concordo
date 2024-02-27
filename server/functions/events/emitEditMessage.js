import cache from "../../cache/index.js";
import Info from "../../schemas/chat/Info.js";

export default async function (io, chatId, messageId, messagem, updatedAt) {
    const info = await Info(chatId).findOne({
        infodoc: true,
    });

    const members = info.members_id;
    if (!members) return false;

    members.forEach(async (member) => {
        const getMemberSocket = await cache.getSocketsByUserId(member.toString());

        if (getMemberSocket) {
            getMemberSocket.forEach((sid) => {
                io.to(sid).emit("messageEdited", {
                    chat_id: chatId,
                    messageId: messageId,
                    message: messagem,
                    updatedAt: updatedAt,
                });
            });
        }
    });
}
