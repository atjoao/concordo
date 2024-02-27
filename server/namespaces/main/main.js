import cache from "../../cache/index.js";
import functions from "../../functions/functions.js";
import tokenVerification from "../../middlewares/tokenVerification.js";

const mainSocketHandler = (io) => {
    io.use(async (socket, next) => {
        await tokenVerification(socket, next).catch((error) => {
            return socket.disconnect();
        });
    });

    io.on("connection", async (socket) => {
        socket.emit("hello", "tas ligado!");
        const userId = socket.data.userId;
        await cache.saveUser(userId, socket.id);
        await functions.setUser(userId, true);
        const userOnlineFriends = await functions.findUserFriends(userId);
        socket.emit("onlineFriends", userOnlineFriends);

        await functions.emitFriendOnline(io, userOnlineFriends, userId);

        const pingInterval = setInterval(() => {
            socket.emit("ping");

            const timeout = setTimeout(async () => {
                await cache
                    .removeSocket(userId, socket.id)
                    .then(async () => {
                        const setUserStatus = await functions.setUser(userId, false);
                        if (setUserStatus === false) {
                            await functions.emitFriendOffline(io, userOnlineFriends, userId);
                        }
                    })
                    .catch(async (error) => {
                        const setUserStatus = await functions.setUser(userId, false);
                        if (setUserStatus === false) {
                            await functions.emitFriendOffline(io, userOnlineFriends, userId);
                        }
                    });
                socket.emit("logout");
                socket.disconnect();

                clearInterval(pingInterval);
            }, 5000);

            socket.once("pong", () => {
                clearTimeout(timeout);
            });
        }, 30000);

        socket.on("disconnect", async () => {
            clearTimeout(pingInterval);
            await cache.removeSocket(userId, socket.id).then(async () => {
                const setUserStatus = await functions.setUser(userId, false);
                if (setUserStatus === false) {
                    await functions.emitFriendOffline(io, userOnlineFriends, userId);
                }
            });
        });
    });
};

export default mainSocketHandler;
