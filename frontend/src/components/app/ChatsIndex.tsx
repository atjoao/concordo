// @ts-nocheck

import getChatName from "@/lib/fetching/getChatName";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";

import { useLiveQuery } from "dexie-react-hooks";
import { Suspense, useContext, useEffect, useState } from "react";

import styles from "./ChatsIndex.module.css";
import { useRouter, usePathname } from "next/navigation";
import HomeIcon from "../icons/HomeIcon";
import { LayoutCached } from "@/app/app/layout";
//import cache from "@/lib/fetching/cache";
import { createPortal } from "react-dom";
import DialogBase from "../dialogs/DialogBase";
import { createChat } from "@/lib/fetching/createChat";
import { socket } from "@/lib/socket/client";
import { getChatInfo } from "@/lib/fetching/cache";

/* async function getChatInfo(serverIp: string, chatId: string) {
    const response = await fetch(serverIp + "/chat/getChatInfo/" + chatId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const chRes = await response.json();
    const dataObj: IChat = {
        id: chatId,
        members_id: chRes.chatInfo.members_id,
        chatType: chRes.chatInfo.chatType,
        chatName: chRes.chatInfo.chatName,
        chatAvatar: chRes.chatInfo.chatAvatar,
        chatOwnerId: chRes.chatInfo.chatOwnerId,
    };

    return dataObj;
} */

function closeChat(serverIp: string, chatId: string) {
    const response = fetch(serverIp + "/chat/closeChat/" + chatId, {
        method: "delete",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    }).then((resp) => {
        return resp.ok;
    });
}

function ChatsIndex({ profile, preload }: any) {
    const pathname = usePathname();
    const router = useRouter();

    const { serverIp, userChats, setUserChats, chatInfos, setChatInfos } = useContext(LayoutCached);

    const [chatNames, setChatNames] = useState<string[]>([]);
    const [openBox, setOpenBox] = useState<boolean>(false);
    const [LeaveBox, setLeaveBox] = useState<string>("");
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);

    const [load, setLoad] = useState(false);
    const friends = useLiveQuery(() => _userInfoDb.user.toArray());

    useEffect(() => {
        const fetchChatInfos = async () => {
            if (userChats) {
                const chatPromises = userChats.map((id) => {
                    return getChatInfo(serverIp, id, profile);
                    //return getChatInfo(serverIp, id);
                });

                const chatInfosResult = await Promise.all(chatPromises);
                setChatInfos(chatInfosResult.filter((chat) => chat !== undefined));
            }
        };

        fetchChatInfos();
        setLoad(true);
    }, [userChats, friends]);

    useEffect(() => {
        const fetchChatNames = () => {
            const chatNamesPromises = chatInfos.map((chat: any) => {
                return getChatName(chat.members_id, chat.chatType, profile.info.id, serverIp, chat);
            });

            Promise.all(chatNamesPromises)
                .then((chatNamesResult) => {
                    setLoad(false);
                    return setChatNames(chatNamesResult);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        if (load) fetchChatNames();
    }, [chatInfos]);

    function getCurrentPathname() {
        return window.location.pathname;
    }

    useEffect(() => {
        if (preload) return;
        socket?.on("removeChat", (data) => {
            setUserChats((userChats: any[]) => {
                if (userChats.includes(data.chat_id)) {
                    return userChats.filter((chat) => chat !== data.chat_id);
                }
                return userChats;
            });

            const pathname = getCurrentPathname();

            if (pathname == "/app/chat/" + data.chat_id) {
                router.push("/app");
            }
        });
        return () => {
            socket?.off("removeChat");
        };
    }, []);

    return (
        <>
            <div className={styles.chatContainer}>
                <a
                    className={pathname == "/app" ? styles.homeButton + " " + styles.homeActive : styles.homeButton}
                    onClick={() => router.push("/app", undefined, { shallow: true })}
                >
                    <HomeIcon /> Inicio
                </a>
                <div className={styles.messageCreate}>
                    <p>As tuas messagens</p>
                    <p onClick={() => setOpenBox(!openBox)}>+</p>
                </div>

                {chatInfos.map((chat: any, index: number) => {
                    return (
                        <div
                            key={chat.id}
                            className={
                                pathname == "/app/chat/" + chat.id
                                    ? styles.chat + " " + styles.active
                                    : typeof chatNames[index] === undefined
                                    ? styles.pulse + " " + styles.chat
                                    : styles.chat
                            }
                            onClick={() =>
                                router.push("/app/chat/" + chat.id, undefined, {
                                    shallow: true,
                                })
                            }
                            data-itemtype="chat"
                            data-chatid={chat.id}
                        >
                            {chatNames[index] !== undefined ? (
                                <>
                                    {chatInfos[index].chatType === "PM" && (
                                        <>
                                            <img
                                                src={serverIp + "/avatar/" + chatNames[index].avatar}
                                                alt={"Avatar de " + chatNames[index].username}
                                            />
                                            <div>
                                                <p>{chatNames[index].username}</p>
                                                <p>{chatNames[index].online ? "🟢 Online" : "⚫ Offline"}</p>
                                            </div>
                                        </>
                                    )}

                                    {chatInfos[index].chatType === "GP" && (
                                        <>
                                            <img
                                                src={serverIp + "/getGroupProfile/" + chatInfos[index].id}
                                                alt={"Avatar de grupo de " + chatInfos[index].chatName}
                                            />
                                            <div>
                                                <p>{chatInfos[index].chatName}</p>
                                                <p>{"Membros: " + chatInfos[index].members_id.length}</p>
                                            </div>
                                        </>
                                    )}
                                    <div className={styles.closeButton}>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                if (chatInfos[index].chatType === "PM") {
                                                    const isChatClosed = closeChat(serverIp, chat.id);
                                                    if (isChatClosed || !isChatClosed) {
                                                        let filter = chatInfos.filter(
                                                            (chatItem: any) => chatItem.id !== chat.id
                                                        );

                                                        setChatInfos(filter);

                                                        filter = userChats.filter(
                                                            (chatItem: any) => chatItem !== chat.id
                                                        );

                                                        setUserChats(filter);
                                                        if (pathname == "/app/chat/" + chat.id) {
                                                            router.push("/app");
                                                            return;
                                                        }
                                                    }
                                                } else {
                                                    setLeaveBox(chat.id);
                                                }
                                            }}
                                        >
                                            <g>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={0}
                                                    fillRule="evenodd"
                                                    clipRule={"evenodd"}
                                                    d="M12 10.9394L16.9697 5.96961L18.0304 7.03027L13.0606 12L18.0303 16.9697L16.9697 18.0304L12 13.0607L7.03045 18.0302L5.96979 16.9696L10.9393 12L5.96973 7.03042L7.03039 5.96976L12 10.9394Z"
                                                    fill="var(--textBgColor)"
                                                ></path>
                                            </g>
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.square}></div>
                                    <div className={styles.items}>
                                        <div className={styles.line}></div>
                                        <div className={styles.line}></div>
                                    </div>
                                    <div className={styles.closeButton}></div>
                                </>
                            )}
                            {LeaveBox == String(chat.id) &&
                                createPortal(
                                    <DialogBase
                                        title={'A sair do grupo "' + chatInfos[index].chatName + '"'}
                                        description={
                                            "Ao clicares em sair do grupo só poderas voltar a entrar se te convidarem de novo"
                                        }
                                        submitActionName="Sair do grupo"
                                        cancelAction={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setLeaveBox("");
                                        }}
                                        submitAction={() => {
                                            const isChatClosed = closeChat(serverIp, chat.id);
                                            if (isChatClosed || !isChatClosed) {
                                                let filter = chatInfos.filter(
                                                    (chatItem: any) => chatItem.id !== chat.id
                                                );

                                                setChatInfos(filter);

                                                filter = userChats.filter((chatItem: any) => chatItem !== chat.id);

                                                setUserChats(filter);
                                                setLeaveBox("");

                                                if (pathname == "/app/chat/" + chat.id) {
                                                    router.push("/app");
                                                    return;
                                                }
                                            }
                                        }}
                                    ></DialogBase>,
                                    //@ts-ignore
                                    document.getElementById("appMount")
                                )}
                        </div>
                    );
                })}

                {openBox &&
                    createPortal(
                        <DialogBase
                            title="Abrir um chat?"
                            description={"Abra um chat com alguém ou crie um grupo com os seus amigos."}
                            cancelAction={() => {
                                setOpenBox(!openBox);
                                setSelectedUsers([]);
                            }}
                            submitActionName={selectedUsers.length >= 2 ? "Criar Grupo" : "Criar Chat"}
                            color={true}
                            submitAction={async () => {
                                if (selectedUsers.length == 0) {
                                    return;
                                }
                                const chatId = await createChat(selectedUsers, userChats, setUserChats);
                                if (chatId) {
                                    router.push("/app/chat/" + chatId, undefined);
                                    setSelectedUsers([]);
                                    setOpenBox(!openBox);
                                }
                            }}
                        >
                            {selectedUsers.length > 0 && (
                                <div style={{ paddingBottom: "5px" }} className={styles.selectedUsers}>
                                    <p>Pessoas selecionadas:</p>

                                    <div>
                                        {selectedUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => {
                                                    setSelectedUsers((users) => {
                                                        return users.filter((userfilter) => userfilter.id !== user.id);
                                                    });
                                                }}
                                            >
                                                {user.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className={styles.friendsList}>
                                {friends &&
                                    friends?.length > 0 &&
                                    friends?.map((friend: User) => (
                                        <label className={styles.friendsListLabel} key={friend.id}>
                                            <input
                                                type="checkbox"
                                                readOnly={true}
                                                checked={selectedUsers.some((user) => user.id === friend.id)}
                                                onClick={() => {
                                                    setSelectedUsers((users) => {
                                                        if (users.some((user) => user.id === friend.id)) {
                                                            return users.filter((user) => user.id !== friend.id);
                                                        } else {
                                                            return [
                                                                ...users,
                                                                {
                                                                    id: friend.id,
                                                                    name: `${friend.username}#${friend.descrim}`,
                                                                },
                                                            ];
                                                        }
                                                    });
                                                }}
                                            />
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <img
                                                    src={serverIp + "/avatar/" + friend.avatar}
                                                    alt={"Avatar de " + friend.username}
                                                />
                                                <p>
                                                    {friend.username}#{friend.descrim}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                            </div>
                        </DialogBase>,
                        //@ts-ignore
                        document.getElementById("appMount")
                    )}
            </div>
        </>
    );
}

export default ChatsIndex;
