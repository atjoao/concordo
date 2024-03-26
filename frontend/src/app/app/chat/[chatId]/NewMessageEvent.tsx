"use client";

import { socket } from "@/lib/socket/client";
import { useContext, useEffect } from "react";
import { ChatMessagesContext } from "./page";
import { IChat } from "@/lib/interfaces";

export default function NewMessageEvent({ chatId }: any) {
    const { setMessages, setMessageCount, setLastMessage, setHeaderInfo }: any = useContext(ChatMessagesContext);

    useEffect(() => {
        socket?.on("newMessage", handleNewMessage);
        socket?.on("messageDeleted", handleMessageDeleted);
        socket?.on("messageEdited", handleMessageEdited);
        socket?.on("userLeft", handleUserLeft);
        socket?.on("newUserJoined", handleUserJoin);
        socket?.on("groupChange", handleGroupChange_p);

        return () => {
            socket?.off("newMessage", handleNewMessage);
            socket?.off("messageDeleted", handleMessageDeleted);
            socket?.off("messageEdited", handleMessageEdited);
            socket?.off("userLeft", handleUserLeft);
            socket?.off("newUserJoined", handleUserJoin);
            socket?.off("groupChange", handleGroupChange_p);
        };
    }, []);

    const handleNewMessage = (data: { chat_id: any; _id: any }) => {
        if (data.chat_id !== chatId) return;

        setMessages((prevMessages: any[]) => {
            if (!prevMessages.some((msg: { _id: any }) => msg._id === data._id)) {
                const newMessages = [...prevMessages, data];
                setMessages(newMessages);
                setMessageCount((prevCount: number) => prevCount + 1);
                setLastMessage(null);
                return newMessages;
            }
            return prevMessages;
        });
        return;
    };

    const handleMessageDeleted = (data: { chat_id: any; messageId: any }) => {
        if (data.chat_id !== chatId) return;

        setMessageCount((prevCount: number) => prevCount - 1);
        setMessages((prevMessages: any[]) => prevMessages.filter((msg: { _id: any }) => msg._id !== data.messageId));
        return;
    };

    const handleMessageEdited = (data: { chat_id: any; messageId: any; message: any; updatedAt: any }) => {
        if (data.chat_id !== chatId) return;

        setMessages((prevMessages: any[]) =>
            prevMessages.map((msg: { _id: any }) =>
                msg._id === data.messageId ? { ...msg, content: data.message, updatedAt: data.updatedAt } : msg
            )
        );
        return;
    };

    const handleUserLeft = (data: { chat_id: any; memberId: any }) => {
        if (data.chat_id !== chatId) return;

        setHeaderInfo((headerInfo: { members_id: any[] }) => {
            if (headerInfo.members_id.includes(data.memberId)) {
                const chat = {
                    ...headerInfo,
                    members_id: headerInfo.members_id.filter((member: any) => member !== data.memberId),
                };
                const chatIndexEl = document.querySelector(`div[data-chatid="${data.chat_id}"]`);
                if (chatIndexEl) chatIndexEl.children[1].children[1].textContent = "Membros: " + chat.members_id.length;
                return chat;
            }
            return headerInfo;
        });
        return;
    };

    const handleUserJoin = (data: any) => {
        if (data.chat_id !== chatId) return;

        setHeaderInfo((headerInfo: { members_id: any[] }) => {
            return {
                ...headerInfo,
                members_id: data.members_id,
            };
        });
        return;
    };

    const handleGroupChange_p = (data: any) => {
        if (data.chat_id !== chatId) return;

        setHeaderInfo((prevHeaderInfo: IChat) => {
            return {
                ...prevHeaderInfo,
                chatName: data.chatName ? data.chatName : prevHeaderInfo.chatName,
                chatAvatar: data.chatAvatar ? data.chatAvatar : prevHeaderInfo.chatAvatar,
            };
        });
    };

    return <></>;
}
