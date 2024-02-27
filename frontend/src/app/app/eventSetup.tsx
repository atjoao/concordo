"use client";

import { useRouter, usePathname } from "next/navigation";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { socket } from "@/lib/socket/client";
import { useContext, useEffect, useState } from "react";
import { LayoutCached } from "./layout";
import { checkDb_user, removeFromCache } from "@/lib/fetching/getChatName";

async function addFriend(data: any) {
    const dataObj: User = {
        id: data._id,
        descrim: data.descrim,
        username: data.username,
        avatar: data.avatar,
        online: 1,
    };

    const user: User | undefined = await _userInfoDb.user.get(data._id);
    if (!user) {
        await _userInfoDb.user.put(dataObj);
    } else {
        await _userInfoDb.user.update(data._id, { online: 1 });
    }
}

async function setFriendOffline(data: any) {
    const user: User | undefined = await _userInfoDb.user.get(data);

    if (user) {
        await _userInfoDb.user.update(data, { online: 0 });
    }
}

async function update_user(data: any) {
    const user: User | undefined = await _userInfoDb.user.get(data.userId);

    if (user) {
        await _userInfoDb.user.update(data.userId, { ...data });
    }
}

async function removeFriend(data: any) {
    removeFromCache(data);
    const user: User | undefined = await _userInfoDb.user.get(data);

    if (user) {
        await _userInfoDb.user.update(data, { online: 0 }).then(async () => {
            await _userInfoDb.user.delete(data);
        });
    }
}

const eventSetup = () => {
    const { setUserChats, set_sent_requests, set_f_requests, set_blocked, serverIp, setChatInfos }: any =
        useContext(LayoutCached);

    useEffect(() => {
        socket?.on("friendAdded", handleFriendAdded);
        socket?.on("updateRequestsSent", handleUpdateRequestsSent);
        socket?.on("updateRequestsList", handleUpdateRequestsList);
        socket?.on("newFriendOnline", handleNewFriendOnline);
        socket?.on("friendOffline", handleFriendOffline);
        socket?.on("friendRemoved", handleFriendRemoved);
        socket?.on("updateFriends_r", handleUpdateFriends_r);
        socket?.on("updateBlockList", handleUpdateBlockList);
        socket?.on("newMessage", handleNewMessage);
        socket?.on("removeRequest", handleRemoveRequest);
        socket?.on("userUpdated", handleUserUpdated);
        socket?.on("openGroupChat", handleOpenGroupChat);
        socket?.on("logout", handleLogout);
        //socket?.on("removeChat", handleRemoveChat);
        socket?.on("userLeft", handleUserLeft);
        socket?.on("newUserJoined", handleUserJoined);
        socket?.on("ping", handlePing);

        socket?.on("groupChange", handleGroupChange);

        return () => {
            console.log("[page] de-redendering");

            socket?.off("friendAdded", handleFriendAdded);
            socket?.off("updateRequestsSent", handleUpdateRequestsSent);
            socket?.off("updateRequestsList", handleUpdateRequestsList);
            socket?.off("newFriendOnline", handleNewFriendOnline);
            socket?.off("friendOffline", handleFriendOffline);
            socket?.off("friendRemoved", handleFriendRemoved);
            socket?.off("updateFriends_r", handleUpdateFriends_r);
            socket?.off("updateBlockList", handleUpdateBlockList);
            socket?.off("newMessage", handleNewMessage);
            socket?.off("removeRequest", handleRemoveRequest);
            socket?.off("userUpdated", handleUserUpdated);
            socket?.off("openGroupChat", handleOpenGroupChat);
            //socket?.off("removeChat", handleRemoveChat);

            socket?.off("logout", handleLogout);
            socket?.off("userLeft", handleUserLeft);
            socket?.off("newUserJoined", handleUserJoined);
            socket?.off("groupChange", handleGroupChange);
            socket?.off("ping", handlePing);
        };
    }, []);

    const handlePing = () => {
        socket?.emit("pong");
    };

    const handleFriendAdded = (data: { id: string; type: string }) => {
        checkDb_user(data.id, serverIp, true);

        if (data.type == "friend_request_accepted") {
            set_f_requests((prevFRequests: any[]) => prevFRequests.filter((request: any) => request !== data.id));

            set_sent_requests((prevSentRequests: any[]) =>
                prevSentRequests.filter((request: any) => request !== data.id)
            );
        }
        return;
    };

    const handleUpdateRequestsSent = (data: any) => {
        set_f_requests((frequests_list: any[]) => {
            if (!frequests_list.includes(data)) {
                return [...frequests_list, data];
            }
            return frequests_list;
        });
        return;
    };

    const handleUpdateRequestsList = (data: any) => {
        set_sent_requests((sent_requests_list: any[]) => {
            if (!sent_requests_list.includes(data)) {
                return [...sent_requests_list, data];
            }
            return sent_requests_list;
        });
        return;
    };

    const handleNewFriendOnline = (data: any) => {
        addFriend(data);
        return;
    };

    const handleFriendOffline = (data: any) => {
        setFriendOffline(data);
        return;
    };

    const handleFriendRemoved = (data: any) => {
        removeFriend(data);
        return;
    };

    const handleUpdateFriends_r = (data: any) => {
        removeFriend(data);
        return;
    };

    const handleUpdateBlockList = (data: { type: any; uid: any }) => {
        switch (data.type) {
            case "remove": {
                set_blocked((blocked_list: any[]) => blocked_list.filter((request: any) => request !== data.uid));
                break;
            }
            case "add": {
                set_blocked((blocked_list: any[]) => {
                    if (!blocked_list.includes(data)) {
                        return [...blocked_list, data.uid];
                    }
                    return blocked_list;
                });
                break;
            }
        }
        return;
    };

    const handleNewMessage = (data: { chat_id: any }) => {
        setUserChats((userChats: any[]) => {
            if (!userChats.includes(data.chat_id)) {
                return [data.chat_id, ...userChats];
            }
            return userChats;
        });
    };

    const handleRemoveRequest = (data: any) => {
        set_f_requests((prevFRequests: any[]) => prevFRequests.filter((request: any) => request !== data));

        set_sent_requests((prevSentRequests: any[]) => prevSentRequests.filter((request: any) => request !== data));
        return;
    };

    const handleUserUpdated = (data: any) => {
        update_user(data);
        return;
    };

    const handleOpenGroupChat = (data: any) => {
        console.log(data);
        setUserChats((userChats: any[]) => {
            if (!userChats.includes(data)) {
                return [data, ...userChats];
            }
            return userChats;
        });
        return;
    };

    const handleLogout = (data: any) => {
        localStorage.removeItem("token");
        if (socket) {
            socket.close();
        }
        window.location.reload();
        return;
    };

    const handleUserLeft = (data: { chat_id: any; memberId: any }) => {
        setChatInfos((chatInfos: any[]) => {
            chatInfos.some((chat: { id: any; members_id: any[] }) => {
                if (chat.id == data.chat_id && chat.members_id.includes(data.memberId)) {
                    chat.members_id = chat.members_id.filter((memberId: any) => memberId !== data.memberId);
                }
                const chatIndexEl = document.querySelector(`div[data-chatid="${data.chat_id}"]`);
                if (chatIndexEl) chatIndexEl.children[1].children[1].textContent = "Membros: " + chat.members_id.length;
            });

            return chatInfos;
        });
    };

    const handleUserJoined = (data: any) => {
        setChatInfos((chatInfos: any[]) => {
            chatInfos.some((chat: { id: any; members_id: any[] }) => {
                if (chat.id == data.chat_id && chat.members_id.includes(data.memberId)) {
                    chat.members_id = data.members_id;
                }
                const chatIndexEl = document.querySelector(`div[data-chatid="${data.chat_id}"]`);
                if (chatIndexEl) chatIndexEl.children[1].children[1].textContent = "Membros: " + data.members_id.length;
            });

            return chatInfos;
        });
    };

    const handleGroupChange = (data: any) => {
        setChatInfos((chatInfos: any[]) => {
            chatInfos.some((chat: { id: any; chatName: string; chatAvatar: string }) => {
                if (chat.id == data.chat_id) {
                    if (data.chatName) chat.chatName = data.chatName;
                    if (data.chatAvatar) chat.chatAvatar = data.chatAvatar;

                    const chatIndexEl = document.querySelector(`div[data-chatid="${data.chat_id}"]`);
                    if (chatIndexEl) {
                        const img: HTMLImageElement = chatIndexEl.children[0] as HTMLImageElement;
                        if (img) img.alt = "Avatar de grupo de " + data.chatName;
                        if (img && data.chatAvatar) img.src = serverIp + "/getGroupProfile/" + data.chatAvatar;

                        const p: HTMLParagraphElement = chatIndexEl.children[1].children[0] as HTMLParagraphElement;
                        if (p && data.chatName) p.textContent = data.chatName;
                    }
                }
            });

            return chatInfos;
        });
    };

    return <></>;
};

export default eventSetup;
