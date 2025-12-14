import cache from "../../cache/index.js";
import Info from "../../schemas/chat/Info.js";

export default async function (io, document) {
    const info = await Info(document.chat_id).findOne({
        infodoc: true,
    });
    if (!info) return false;

    const members = info.members_id;
    if (!members) return false;

    members.forEach(async (member) => {
        const getMemberSocket = await cache.getSocketsByUserId(member.toString());

        if (Array.isArray(getMemberSocket)) {
            getMemberSocket.forEach((sid) => {
                if (sid !== document.socketId) io.to(sid).emit("newMessage", document);
            });
        }
    });
}
