import cache from "../../cache/index.js";
import Info from "../../schemas/chat/Info.js";

export default async function (io, data) {
    const groupInfo = await Info(data).findOne({
        infodoc: true,
    });

    if (!Array.isArray(groupInfo.members_id) && !groupInfo.members_id) return;

    groupInfo.members_id.forEach(async (member) => {
        const userSockets = await cache.getSocketsByUserId(member);

        if (!userSockets) return 0;

        for (const sid of userSockets) {
            io.to(sid).emit("openGroupChat", data);
        }
    });
}
