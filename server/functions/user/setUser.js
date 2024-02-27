import cache from "../../cache/index.js";
import User from "../../schemas/user/User.js";

export default async function (userId, connected) {
    const checkUser = await cache.getSocketsByUserId(userId);

    if (!checkUser || connected) {
        const user = await User.findOneAndUpdate({ _id: userId }, { $set: { online: connected } }, { new: true });
        return user.online;
    }
}
