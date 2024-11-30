import { checkDb_user } from "@/lib/fetching/getChatName";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { utcToZonedTime, format } from "date-fns-tz";

import { ChatMessagesContext } from "@/app/app/chat/[chatId]/page";

import styles from "./ChatMessages.module.css";
import ChatStart from "./ChatStart";
import InitialMessage from "./ChatMessageComponents/InitialMessage";
import Message from "./ChatMessageComponents/Message";
import { LayoutCached } from "@/app/app/layout";
import SystemMessage from "./ChatMessageComponents/SystemMessage";

export default function ChatMessages({ chatId, serverIp, headerInfo }: any) {
    const { profile }: any = useContext(LayoutCached);

    const {
        messages,
        setMessages,
        messageCount,
        setMessageCount,
        setEditMessage,
        editMessage,
        lastMessage,
        setLastMessage,
    }: any = useContext(ChatMessagesContext);

    const [currentToolbox, setCurrentToolbox] = useState(null);

    const [userNames, setUserNames] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const bottomRef = useRef<any>(null);
    const messageContainer = useRef<HTMLDivElement | null>(null);
    //const [lastScrollTop, setLastScrollTop] = useState<number | null>(null);

    const [prevMessages, setPrevMessages] = useState<string>("");

    function sendEditMessage(message: any) {
        // @ts-ignore
        const conteudo = document.querySelector("#currentEditMessage").innerText.replace(/\n$/, "");
        if (conteudo.trim() === "") {
            setEditMessage(null);
            return;
        }

        fetch(serverIp + "/chat/editMessage/" + chatId + "/" + message._id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                content: conteudo.trim(),
            }),
        })
            .then((resp) => resp.json())
            .then((resp) => {
                setEditMessage(null);
                setMessages((msg: any[]) => {
                    return msg.map((item) => {
                        if (item._id === resp.message._id) {
                            return { ...item, content: resp.message.content };
                        }
                        return item;
                    });
                });
            });
    }

    const updateCurrentTime = () => {
        setCurrentTime(new Date());
    };

    useEffect(() => {
        const updateTime = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(updateTime);
    }, []);

    useEffect(() => {
        function preventScrollTop(e: Event) {
            // @ts-ignore
            if (e.target) e.target.scrollIntoView();
        }
        document.addEventListener("fullscreenchange", preventScrollTop);

        return () => {
            document.removeEventListener("fullscreenchange", preventScrollTop);
        };
    }, []);

    function apagarMessagem(message: any) {
        fetch(serverIp + "/chat/deleteMessage/" + chatId + "/" + message._id, {
            method: "delete",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }).then((resp) => {
            return 1;
        });
    }

    function convertReadableHour(UTCdate: string) {
        const date = new Date(UTCdate);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const convertedTime = utcToZonedTime(date, timezone);
        const formatTime = format(convertedTime, "HH:mm");

        return String(formatTime);
    }

    function convertReadableHourAndDate(UTCdate: string) {
        const date = new Date(UTCdate);
        const today = new Date(currentTime);
        const yesterday = new Date(currentTime);
        yesterday.setDate(today.getDate() - 1);

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const convertedTime = utcToZonedTime(date, timezone);

        if (convertedTime.toDateString() === today.toDateString() && convertedTime.getDate() === today.getDate()) {
            return `Hoje ás ${format(convertedTime, "HH:mm")}`;
        } else if (
            convertedTime.toDateString() === yesterday.toDateString() &&
            convertedTime.getDate() === yesterday.getDate()
        ) {
            return `Ontem ás ${format(convertedTime, "HH:mm")}`;
        } else {
            return format(convertedTime, "dd/MM/yyyy HH:mm");
        }
    }

    function convertFullTime(UTCdate: string) {
        const date = new Date(UTCdate);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const convertedTime = utcToZonedTime(date, timezone);
        const formatTime = format(convertedTime, "dd-MM-yyyy");

        return String(formatTime);
    }

    function loadBeforeMessages(prevMessages: string) {
        if (prevMessages == "" || prevMessages == null) return;
        const uri = new URL(prevMessages);
        const newUrl = window.location.protocol + "//" + uri.host + uri.pathname + uri.search;
        return new Promise((resolve, reject) => {
            fetch(newUrl, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    const ToInsert = data.messagens;
                    const messagesToInsert = ToInsert.slice().reverse();
                    setMessages([...messagesToInsert, ...messages]);
                    setMessageCount(data.count);
                    setPrevMessages(data.prev);

                    resolve(data.messagens[data.messagens.length - 1]._id);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${serverIp}/chat/getMessages/${chatId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });
                const data = await response.json();
                setMessages(data.messagens.reverse());
                setMessageCount(data.count);
                setPrevMessages(data.prev);
            } catch (error) {
                console.log(error);
            }
        };
        if (messages.length === 0) {
            fetchMessages().then(() => {
                const container = messageContainer.current;
                container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
            });
        }
    }, []);

    useEffect(() => {
        const fetchUserNames = async () => {
            const names: any = { ...userNames };

            for (const message of messages) {
                if (!names[message.user_id]) {
                    try {
                        if (!message._id) {
                            return;
                        }
                        const resp = await checkDb_user(message.user_id, serverIp, false);
                        names[message.user_id] = resp;
                    } catch (error) {
                        console.error(error);
                    }
                }
            }

            setUserNames((prevUserNames: any) => {
                return names;
            });
        };

        fetchUserNames();
    }, [messages]);

    useEffect(() => {
        if (!lastMessage) {
            setTimeout(() => {
                //@ts-ignore
                bottomRef.current?.scrollIntoView();
            });
            return;
        }

        const getMessageBeforeLoad = document.querySelectorAll(`[data-messageid="${lastMessage}"]`)[0];
        getMessageBeforeLoad?.scrollIntoView();
    }, [userNames, lastMessage]);

    useEffect(() => {
        // bug here in dev mode
        const evento = async (e: Event) => {
            if (container?.scrollTop === 0) {
                const loaderElement = document.querySelector("#loader");
                if (loaderElement?.nextElementSibling) {
                    const messageId = loaderElement.nextElementSibling.children[0].getAttribute("data-messageid");
                    const a = await loadBeforeMessages(prevMessages);
                    if (a) setLastMessage(messageId);
                }
            }
        };
        //@ts-nocheck
        const container = messageContainer.current;

        if (!messages || container?.scrollTop === 0) {
            const loaderElement = document.querySelector("#loader");
            if (loaderElement?.nextElementSibling) {
                const messageId = loaderElement.nextElementSibling.children[0]?.getAttribute("data-messageid");
                if (messageId) loadBeforeMessages(prevMessages);
                if (!messageId) {
                    if (messages[0] !== undefined) {
                        loadBeforeMessages(prevMessages);
                    }
                }
            }
        }

        container?.addEventListener("scroll", evento);

        return () => {
            container?.removeEventListener("scroll", evento);
        };
    }, [messages]);

    return (
        // @ts-ignore
        <div
            className={styles.messagesContainer}
            ref={messageContainer}
            onClick={() => {
                if (currentToolbox != null) {
                    setCurrentToolbox(null);
                }
            }}
        >
            {(!messages.length || messages.length === messageCount) && (
                <ChatStart serverIp={serverIp} headerInfo={headerInfo} />
            )}
            {(!messages || !userNames) && <p id="loader_nomsg">A carregar mensagens</p>}
            {messages.length < messageCount && <p id="loader">A carregar messagens</p>}
            {messages.map((message: any, index: any) => {
                const prevMessageAuthor = messages[index - 1]?.user_id === message.user_id;

                const oldMDate = new Date(messages[index - 1]?.createdAt);

                const mDate = new Date(message.createdAt);

                const greaterThanOneDay = `${oldMDate.toDateString()}` != `${mDate.toDateString()}`;

                const messageEdited = message.createdAt != message.updatedAt;

                const sistema = message.user_id == "Sistema";
                return (
                    <div key={message._id} data-edited={messageEdited}>
                        {!message._id.startsWith("error_") && !sistema && (
                            <>
                                {(index === 0 || !prevMessageAuthor) && userNames[message.user_id] !== undefined && (
                                    <>
                                        {greaterThanOneDay && index !== 0 && (
                                            <div
                                                className={styles.timeBorder}
                                                key={"time" + message.createdAt + "message_id" + message._id}
                                            >
                                                {convertFullTime(message.createdAt)}
                                            </div>
                                        )}
                                        <InitialMessage
                                            serverIp={serverIp}
                                            message={message}
                                            user={userNames[message.user_id]}
                                            chatId={chatId}
                                            profile={profile}
                                            currentToolbox={currentToolbox}
                                            setCurrentToolbox={setCurrentToolbox}
                                            convertReadableHourAndDate={convertReadableHourAndDate}
                                            apagarMessagem={apagarMessagem}
                                            key={message._id}
                                            editMessage={editMessage}
                                            setEditMessage={setEditMessage}
                                            messageEdited={messageEdited}
                                            sendEditMessage={sendEditMessage}
                                        />
                                    </>
                                )}

                                {greaterThanOneDay && prevMessageAuthor && userNames[message.user_id] !== undefined && (
                                    <>
                                        <div
                                            className={styles.timeBorder}
                                            key={"time" + message.createdAt + "message_id" + message._id}
                                        >
                                            {convertFullTime(message.createdAt)}
                                        </div>
                                        <InitialMessage
                                            serverIp={serverIp}
                                            message={message}
                                            user={userNames[message.user_id]}
                                            chatId={chatId}
                                            profile={profile}
                                            currentToolbox={currentToolbox}
                                            setCurrentToolbox={setCurrentToolbox}
                                            convertReadableHourAndDate={convertReadableHourAndDate}
                                            apagarMessagem={apagarMessagem}
                                            editMessage={editMessage}
                                            messageEdited={messageEdited}
                                            setEditMessage={setEditMessage}
                                            sendEditMessage={sendEditMessage}
                                        />
                                    </>
                                )}

                                {!greaterThanOneDay &&
                                    prevMessageAuthor &&
                                    userNames[message.user_id] !== undefined && (
                                        <>
                                            <Message
                                                profile={profile}
                                                serverIp={serverIp}
                                                message={message}
                                                user={userNames[message.user_id]}
                                                chatId={chatId}
                                                convertReadableHour={convertReadableHour}
                                                currentToolbox={currentToolbox}
                                                setCurrentToolbox={setCurrentToolbox}
                                                convertReadableHourAndDate={convertReadableHourAndDate}
                                                apagarMessagem={apagarMessagem}
                                                editMessage={editMessage}
                                                messageEdited={messageEdited}
                                                setEditMessage={setEditMessage}
                                                sendEditMessage={sendEditMessage}
                                            />
                                        </>
                                    )}
                            </>
                        )}

                        {message._id.startsWith("error_") && (
                            <>
                                <InitialMessage
                                    serverIp={serverIp}
                                    message={message}
                                    user={"error"}
                                    chatId={chatId}
                                    convertReadableHourAndDate={convertReadableHourAndDate}
                                />
                            </>
                        )}

                        {message.user_id == "Sistema" && <SystemMessage message={message} serverIp={serverIp} />}
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
