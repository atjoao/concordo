import cache from "../../cache/index.js";
import Info from "../../schemas/chat/Info.js";

export default async function (io, chatId, messageId) {
    const info = await Info(chatId).findOne({
        infodoc: true,
    });

    const members = info.members_id;
    if (!members) return false;

    members.forEach(async (member) => {
        console.log(member);
        const getMemberSocket = await cache.getSocketsByUserId(member.toString());
        if (getMemberSocket) {
            getMemberSocket.forEach((sid) => {
                io.to(sid).emit("messageDeleted", {
                    chat_id: chatId,
                    messageId: messageId,
                });
            });
        }
    });
}
