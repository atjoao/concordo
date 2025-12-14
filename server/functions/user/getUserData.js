import User from "../../schemas/user/User.js"

export default async function (userId) {
	if (!userId) {
		throw new Error("NO_USER_ID")
	}

	const userData = await User.findById(userId)

	if (!userData) {
		throw new Error("DB_NO_USER_FOUND")
	}
}
