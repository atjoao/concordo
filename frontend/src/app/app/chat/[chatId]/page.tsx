"use client";

import ChatHeader from "@/components/chat/ChatHeader";

//import cache from "@/lib/fetching/cache";

import { useLiveQuery } from "dexie-react-hooks";
import _userInfoDb from "@/lib/database/dbuserInfo";

import getChatName from "@/lib/fetching/getChatName";
import { createContext, useContext, useEffect, useState } from "react";
import { LayoutCached } from "../../layout";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useRouter } from "next/navigation";
import NewMessageEvent from "./NewMessageEvent";
import { IchatMessages } from "@/lib/interfaces";
import ChatHeaderGroup from "@/components/chat/ChatHeaderGroup";
import GroupMemberList from "@/components/chat/GroupMemberList";
import { createPortal } from "react-dom";
import DialogBase from "@/components/dialogs/DialogBase";

export const ChatMessagesContext = createContext<IchatMessages | undefined>(undefined);

export default function Page({ params }: { params: { chatId: string } }) {
    const { serverIp, profile }: any = useContext(LayoutCached);
    const friends = useLiveQuery(() => _userInfoDb.user.toArray());

    const router = useRouter();

    const [chatInfo, setChatInfo] = useState<any>(null);
    const [headerInfo, setHeaderInfo] = useState<any>();

    const [messages, setMessages] = useState<any>([]);
    const [messageCount, setMessageCount] = useState<number>(0);
    const [lastMessage, setLastMessage] = useState<any>();

    const [editMessage, setEditMessage] = useState<any>(null);

    const [editingInput, setEditingInput] = useState<boolean>(false);

    const [linkClicked, setLinkClicked] = useState<{ href: string }>({ href: "" });

    useEffect(() => {
        const loadInfo = async () => {
            fetch(serverIp + "/chat/getChatInfo/" + params.chatId, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            })
                .then((resp) => {
                    if (resp.status == 404) {
                        throw new Error("Não encontrado");
                    } else {
                        return resp.json();
                    }
                })
                .then(async (dados) => {
                    setChatInfo({
                        chatAvatar: dados.chatInfo?.chatAvatar,
                        chatName: dados.chatInfo?.chatName,
                        chatOwnerId: dados.chatInfo?.chatOwnerId,
                        chatType: dados.chatInfo?.chatType,
                        id: dados.chatInfo?.id,
                        members_id: dados.chatInfo?.members_id,
                    });

                    if (!headerInfo && dados.chatInfo) {
                        const _chatInfo = await getChatName(
                            dados.chatInfo?.members_id,
                            dados.chatInfo?.chatType,
                            profile.info.id,
                            serverIp,
                            dados.chatInfo
                        );
                        setHeaderInfo(_chatInfo);
                    }

                    return;
                })
                .catch((err) => {
                    router.push("/app");
                });
            //}

            /* setChatInfo({
                chatAvatar: chatInfo?.chatAvatar,
                chatName: chatInfo?.chatName,
                chatOwnerId: chatInfo?.chatOwnerId,
                chatType: chatInfo?.chatType,
                id: chatInfo?.id,
                members_id: chatInfo?.members_id,
            });

            if (!headerInfo && chatInfo) {
                const chatName = await getChatName(
                    // @ts-ignore
                    chatInfo?.members_id,
                    chatInfo?.chatType,
                    profile.info.id,
                    serverIp,
                    chatInfo
                );
                setHeaderInfo(chatName);
            } */
        };

        setTimeout(() => {
            loadInfo();
        }, 250);
    }, [friends]);

    useEffect(() => {
        function handleClick(e: Event) {
            if (e.target instanceof HTMLAnchorElement) {
                e.preventDefault();
                e.stopPropagation();
                setLinkClicked({ href: decodeURI(e.target.href) });
            }
        }
        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <>
            {headerInfo ? (
                <ChatMessagesContext.Provider
                    value={{
                        messages,
                        setMessages,
                        messageCount,
                        setMessageCount,
                        lastMessage,
                        setLastMessage,
                        editMessage,
                        setEditMessage,
                        headerInfo,
                        setHeaderInfo,
                        editingInput,
                        setEditingInput,
                    }}
                >
                    <NewMessageEvent chatId={params.chatId} />

                    <section id="chat-header">
                        {headerInfo.chatType == "GP" ? (
                            <ChatHeaderGroup headerInfo={headerInfo} chatId={params.chatId} />
                        ) : (
                            <ChatHeader headerInfo={headerInfo} />
                        )}
                    </section>

                    <div style={{ display: "flex", flexDirection: "row", overflowY: "auto", height: "100%" }}>
                        <ChatMessages chatId={params.chatId} serverIp={serverIp} />
                        {headerInfo.chatType == "GP" && (
                            <GroupMemberList headerInfo={headerInfo} chatId={params.chatId} />
                        )}
                    </div>

                    <section id="chat-input" style={{ width: "100%", padding: "10px", position: "relative" }}>
                        <ChatInput chatId={params.chatId} headerInfo={headerInfo} />
                    </section>
                </ChatMessagesContext.Provider>
            ) : (
                <p>a carregar...</p>
            )}

            {linkClicked.href &&
                createPortal(
                    <DialogBase
                        title="Queres ir para outra pagina?"
                        description={"Antes de clicar em links leia se o link é seguro antes de continar"}
                        submitActionName="Continuar"
                        submitAction={() => {
                            window.open(linkClicked.href);
                        }}
                        cancelAction={() => {
                            setLinkClicked({ href: "" });
                        }}
                    >
                        <p style={{
                            overflowWrap: "break-word"
                        }}>Link: {linkClicked.href}</p>
                    </DialogBase>,
                    // @ts-expect-error null is not assignable to type Element
                    document.getElementById("appMount")
                )}
        </>
    );
}
