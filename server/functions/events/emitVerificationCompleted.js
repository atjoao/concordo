import cache from "../../cache/index.js";

export default async function (io, data) {
    const sockets = await cache.getSocketsByUserId(data.userId);
    console.log(sockets);
    if (Array.isArray(sockets)) {
        sockets.forEach((sid) => {
            console.log(sid);
            io.to(sid).emit("verificationCompleted", true);
        });
    }
}
