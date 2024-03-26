import { IChat } from "../interfaces";
import getChatName from "./getChatName";

export const ChatInfo_cache = new Map<string, IChat>();

export const getChatInfo = async (
    serverIp: string,
    chatId: string,
    profile: any,
    setChatInfo?: React.Dispatch<React.SetStateAction<any>>,
    setHeaderInfo?: React.Dispatch<React.SetStateAction<any>>
): Promise<IChat | undefined> => {
    const chatInfo = ChatInfo_cache.get(chatId);
    if (chatInfo) {
        if (setChatInfo) setChatInfo(chatInfo);
        const _chatInfo = await getChatName(
            chatInfo?.members_id,
            chatInfo.chatType,
            profile.info.id,
            serverIp,
            chatInfo
        );
        if (setHeaderInfo) setHeaderInfo(_chatInfo);
    }

    const result = await fetch(serverIp + "/chat/getChatInfo/" + chatId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    });

    if (result.status == 404) {
        throw new Error("Não encontrado");
    }

    const dados = await result.json();
    // comparar cache com o servidor

    if (chatInfo) {
        if (chatInfo !== dados.chatInfo) {
            ChatInfo_cache.set(chatId, {
                chatAvatar: dados.chatInfo?.chatAvatar,
                chatName: dados.chatInfo?.chatName,
                chatOwnerId: dados.chatInfo?.chatOwnerId,
                chatType: dados.chatInfo?.chatType,
                id: chatId,
                members_id: dados.chatInfo?.members_id,
            });
        }
    } else {
        ChatInfo_cache.set(chatId, {
            chatAvatar: dados.chatInfo?.chatAvatar,
            chatName: dados.chatInfo?.chatName,
            chatOwnerId: dados.chatInfo?.chatOwnerId,
            chatType: dados.chatInfo?.chatType,
            id: chatId,
            members_id: dados.chatInfo?.members_id,
        });
    }

    // salvar para cache

    if (setChatInfo) setChatInfo(ChatInfo_cache.get(chatId));
    return ChatInfo_cache.get(chatId);
};

type valueKeys = "chatName" | "chatAvatar" | "chatOwnerId" | "chatType" | "members_id" | "id";
export const changeValue = (chatId: string, key: valueKeys, value: any) => {
    const chatInfo = ChatInfo_cache.get(chatId);
    if (chatInfo) {
        chatInfo[key] = value;

        ChatInfo_cache.set(chatId, chatInfo);
        return true;
    }
    return false;
};
