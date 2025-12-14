import cache from "../../cache/index.js";

export default async function (io, from, to) {
    const requestFrom = await cache.getSocketsByUserId(from);
    const requestTo = await cache.getSocketsByUserId(to);

    if (!requestFrom || !requestTo) {
        return 0;
    }

    if (Array.isArray(requestTo)) {
        requestTo.forEach(async (sid) => {
            io.to(sid).emit("friendAdded", {
                id: from,
                type: "friend_request_accepted",
            });
        });
    }

    if (Array.isArray(requestFrom)) {
        requestFrom.forEach(async (sid) => {
            io.to(sid).emit("friendAdded", {
                id: to,
                type: "friend_request_accepted",
            });
        });
    }
}
