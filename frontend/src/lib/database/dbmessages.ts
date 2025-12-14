/*
import Dexie from "dexie"

export interface IMessage {
	id: string
	user_id: string
	content: string
	filesAnexed: Array<{ file_id: string; file_name: string }> | []
	type: "Message" | "System"
	createdAt: string
	updatedAt: string
}

class messagesTempDb extends Dexie {
	message: Dexie.Table<IMessage, any>

	constructor(chatId: string) {
		super(`messages_${chatId}`)

		this.version(1).stores({
			message: "id, user_id, content, filesAnexed, type, createdAt, updatedAt",
		})
		this.message = this.table("message")
	}
}

function _dbmessaeges(chatId: string): messagesTempDb {
	return new messagesTempDb(chatId)
}

seria uma ideia boa se pudesse apagar tudo 
problema indexeddb nao lista as coisas entao nao posso fazer um loop
so descobri isso depois de escrever isto 
eu armanezeno localmente e fds ig
*/
