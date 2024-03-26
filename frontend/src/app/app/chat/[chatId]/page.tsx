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
import { getChatInfo } from "@/lib/fetching/cache";

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
        getChatInfo(serverIp, params.chatId, profile, setChatInfo, setHeaderInfo)
            .then(async (dados) => {
                if (!headerInfo && dados) {
                    const _chatInfo = await getChatName(
                        dados?.members_id,
                        dados.chatType,
                        profile.info.id,
                        serverIp,
                        dados
                    );
                    setHeaderInfo(_chatInfo);
                }
            })
            .catch((e) => {
                console.log(e);
                router.push("/app");
            });
    }, [friends]);

    useEffect(() => {
        function handleClick(e: Event) {
            if (e.target instanceof HTMLAnchorElement) {
                try {
                    const ur = new URL(e.target.href);
                    if (ur.hostname !== new URL(serverIp).hostname) {
                        e.preventDefault();
                        e.stopPropagation();
                        setLinkClicked({ href: decodeURI(e.target.href) });
                    }
                } catch (error) {
                    if (error instanceof TypeError && error.message.includes("URL constructor")) {
                        return;
                    }
                }
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
                        linkClicked,
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
                        <p
                            style={{
                                overflowWrap: "break-word",
                            }}
                        >
                            Link: {linkClicked.href}
                        </p>
                    </DialogBase>,
                    // @ts-expect-error null is not assignable to type Element
                    document.getElementById("appMount")
                )}
        </>
    );
}
