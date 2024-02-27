import cache from "../../cache/index.js";
import Info from "../../schemas/chat/Info.js";

/**
 * @param {import('socket.io').Socket} io
 */
export default async function (io, data) {
    const groupInfo = await Info(data.chat_id).findOne({
        infodoc: true,
    });

    if (!Array.isArray(groupInfo.members_id) && !groupInfo.members_id) return 0;

    groupInfo.members_id.forEach(async (member) => {
        const userSockets = await cache.getSocketsByUserId(member);
        if (!userSockets) return 0;
        for (const sid of userSockets) {
            io.to(sid).emit("userLeft", data);
        }
    });

    // remove Chat From User Left (kicked);
    const userSockets = await cache.getSocketsByUserId(data.memberId);
    if (!userSockets) return 0;
    for (const sid of userSockets) {
        io.to(sid).emit("removeChat", data);
    }
}
