import cache from "../../cache/index.js";

/**
 * @param {import('socket.io').Socket} io
 */
export default async function (io, data) {
    const useridSockets = await cache.getSocketsByUserId(data.userid);

    if (Array.isArray(useridSockets)) {
        useridSockets.forEach(async (sid) => {
            io.to(sid).emit("logout");
            io.sockets.sockets[sid]?.disconnect(true);
        });
    }
}
