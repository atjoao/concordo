//import User from "../../schemas/user/User.js";
import cache from "../../cache/index.js";
import functions from "../functions.js";

export default async function (io, data) {
    const userOnlineFriends = await functions.findUserFriends(data.userId);

    if (!Array.isArray(userOnlineFriends)) return;

    const selfUserSockets = await cache.getSocketsByUserId(data.userId);

    userOnlineFriends.forEach(async (element) => {
        const userSockets = await cache.getSocketsByUserId(element._id.toString());
        if (!userSockets) return;
        userSockets.forEach(async (sid) => {
            io.to(sid).emit("userUpdated", data);
        });
    });

    if (selfUserSockets && Array.isArray(selfUserSockets)) {
        selfUserSockets.forEach(async (sid) => {
            io.to(sid).emit("selfUpdate", data);
        });
    }

    // TODO transmitir para self estas alterações oof lembrar
}
