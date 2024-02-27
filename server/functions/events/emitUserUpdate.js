//import User from "../../schemas/user/User.js";
import cache from "../../cache/index.js";
import functions from "../functions.js";

export default async function (io, data) {
    const userOnlineFriends = await functions.findUserFriends(data.userId);

    if (!Array.isArray(userOnlineFriends)) return;

    userOnlineFriends.forEach(async (element) => {
        const userSockets = await cache.getSocketsByUserId(element._id.toString());
        const selfUserSockets = await cache.getSocketsByUserId(data.userId);

        for (let users in userSockets) {
            if (selfUserSockets.length === 1) {
                userSockets.forEach(async (sid) => {
                    io.to(sid).emit("userUpdated", data);
                });
            }
        }
    });

    // TODO transmitir para self estas alterações oof lembrar
}
