import cache from "../../cache/index.js";

export default async function (io, data) {
    const useridSockets = await cache.getSocketsByUserId(data.userid);

    if (Array.isArray(useridSockets)) {
        useridSockets.forEach(async (sid) => {
            io.to(sid).emit("updateBlockList", data);
        });
    }

    if (data.type == "add") {
        const uidSockets = await cache.getSocketsByUserId(data.uid);
        if (Array.isArray(uidSockets)) {
            uidSockets.forEach(async (sid) => {
                io.to(sid).emit("friendRemoved", data.userid);
            });
        }
    }
}
