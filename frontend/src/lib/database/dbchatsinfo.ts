/* import Dexie from "dexie"

export interface IChat {
	id?: string
	members_id: string[]
	chatType: "PM" | "GP"
	chatName?: string
	chatAvatar?: string
	chatOwnerId?: string
}

class chatInfoDb extends Dexie {
	chat: Dexie.Table<IChat, any>

	constructor() {
		super("chatinfo_db")

		this.version(1).stores({
			chat: "id, members_id, chatType, chatName, chatAvatar, chatOwnerId",
		})

		this.chat = this.table("chat")
	}
}

const _chatsInfoDb = new chatInfoDb()

export default _chatsInfoDb
 */
