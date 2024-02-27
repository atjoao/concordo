import cache from "../../cache/index.js";

// ngl isto ta confuso
export default async function (io, sender, receiver, type) {
    const requestFrom = await cache.getSocketsByUserId(sender);
    const requestTo = await cache.getSocketsByUserId(receiver);

    if (Array.isArray(requestTo)) {
        requestTo.forEach(async (sid) => {
            io.to(sid).emit("friendRemoved", sender);
        });
    }

    if (Array.isArray(requestFrom)) {
        requestFrom.forEach(async (sid) => {
            io.to(sid).emit("updateFriends_r", receiver);
        });
    }
}
