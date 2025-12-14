import cache from "../../cache/index.js";

export default async function (io, data) {
    const sockets = await cache.getSocketsByUserId(data.userId);

    if (Array.isArray(sockets)) {
        sockets.forEach((sid) => {
            io.to(sid).emit("verificationCompleted", true);
        });
    }
}
