import { IChat } from "../interfaces";

class ChatInfosArr extends Array {
    push(...items: IChat[]): number {
        for (const item of items) {
            const checkItem = this.find((chat) => chat.id === item.id);
            if (!checkItem) {
                Array.prototype.push.call(this, item);
            }
        }

        return this.length;
    }
}

//const ChatInfos = new ChatInfosArr();
//export default { ChatInfos };
