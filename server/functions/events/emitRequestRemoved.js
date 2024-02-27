import cache from "../../cache/index.js";

export default async function (io, from, to) {
    const requestFrom = await cache.getSocketsByUserId(from);
    const requestTo = await cache.getSocketsByUserId(to);

    if (Array.isArray(requestTo)) {
        requestTo.forEach(async (sid) => {
            io.to(sid).emit("removeRequest", from);
        });
    }

    if (Array.isArray(requestFrom)) {
        requestFrom.forEach(async (sid) => {
            io.to(sid).emit("removeRequest", to);
        });
    }
}
