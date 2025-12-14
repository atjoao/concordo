import User from "../../schemas/user/User.js"

export default async function () {
	console.log(
		`\x1b[42m[INFO - DATABASE]\x1b[0m Definir utilizadores para modo offline isto pode demorar algum tempo...`
	)
	return new Promise(async (resolve, reject) => {
		await User.updateMany({ online: false })
			.then(() => {
				resolve()
			})
			.catch((err) => {
				reject()
			})
	})
}
