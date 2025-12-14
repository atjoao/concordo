import cache from "../../cache/index.js"

export default async function (io, userOnlineFriends, userId) {
	if (!Array.isArray(userOnlineFriends)) {
		return 0
	}

	userOnlineFriends.forEach(async (element) => {
		const userSockets = await cache.getSocketsByUserId(element._id.toString())
		if (!userSockets) {
			return 0
		}

		const selfUserSockets = await cache.getSocketsByUserId(userId)

		if (!selfUserSockets) {
			userSockets.forEach((sid) => {
				io.to(sid).emit("friendOffline", userId)
			})
		}
	})
}
