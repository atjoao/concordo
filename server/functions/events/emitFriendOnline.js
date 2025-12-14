import User from "../../schemas/user/User.js"
import cache from "../../cache/index.js"

export default async function (io, userOnlineFriends, userId) {
	userOnlineFriends.forEach(async (element) => {
		const userSockets = await cache.getSocketsByUserId(element._id.toString())
		const selfUserSockets = await cache.getSocketsByUserId(userId)

		for (let users in userSockets) {
			if (selfUserSockets.length === 1) {
				userSockets.forEach(async (sid) => {
					let userData = await User.findById(userId)
					userData = {
						_id: userData._id,
						username: userData.username,
						descrim: userData.descrim,
						avatar: userData.avatar,
					}

					io.to(sid).emit("newFriendOnline", userData)
				})
			}
		}
	})
}
