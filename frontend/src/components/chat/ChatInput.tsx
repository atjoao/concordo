import { useContext, useEffect, useRef, useState } from "react";
import AddFileIcon from "../icons/AddFileIcon";
import styles from "./ChatInput.module.css";
import SendIcon from "../icons/SendIcon";
import TypeIcon from "../icons/TypeIcon";
import TrashBin from "../icons/TrashBin";

import { LayoutCached } from "@/app/app/layout";
import { ChatMessagesContext } from "@/app/app/chat/[chatId]/page";

import { useLiveQuery } from "dexie-react-hooks";
import _userInfoDb from "@/lib/database/dbuserInfo";
import { usePathname } from "next/navigation";
import { socket } from "@/lib/socket/client";

export default function ChatInput({ chatId, headerInfo }: any) {
    const { serverIp, showSettings }: any = useContext(LayoutCached);
    let friends = useLiveQuery(() => _userInfoDb.user.toArray());
    if (headerInfo.chatType == "GP") friends = undefined;

    const date = new Date();

    const {
        editingInput,
        setEditingInput,
        messages,
        setMessages,
        messageCount,
        setMessageCount,
        lastMessage,
        setLastMessage,
        editMessage,
    }: any = useContext(ChatMessagesContext);

    const pathname = usePathname();

    const [input, setInput] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (headerInfo.chatType == "GP") return;
        fetch(serverIp + "/chat/getChatInfo/" + chatId, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        })
            .then((resp) => resp.json())
            .then((dados) => {
                const friends = dados?.friends;
                if (!friends) {
                    const inputDiv: HTMLDivElement | null = document.querySelector("div." + styles.ChatInput);

                    if (inputDiv && inputDiv.parentElement && pathname.includes(chatId)) {
                        inputDiv.parentElement.style.display = "none";
                    }
                }
            });
    }, [friends]);

    async function sendMessage() {
        const formData = new FormData();

        formData.append("socketId", String(socket?.id));

        if (input.length > 0) {
            formData.append("content", input);
        }

        if (files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file, file.name);
            });
        }

        if (files || input) {
            await fetch(serverIp + "/chat/sendMessage/" + chatId, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            })
                .then(async (resp) => {
                    if (!resp.ok) {
                        const r = await resp.json();
                        const content =
                            r?.status === "BIG_FILE"
                                ? "Esta messagem possui ficheiros demasiado grandes"
                                : r?.message + " Erro: " + r?.status;
                        const data = {
                            _id: "error_" + date.valueOf(),
                            content: content,
                            createdAt: date.toISOString(),
                            updatedAt: date.toISOString(),
                            type: "Message",
                            user_id: "erro_sistema",
                        };

                        setMessages([...messages, data]);
                        setMessageCount(messageCount + 1);
                        setLastMessage(null);
                        throw new Error(r?.message);
                    }
                    return resp.json();
                })
                .then((response) => {
                    setMessages((prevMessages: any) => {
                        if (!prevMessages.includes(response)) {
                            const newMessages = [...prevMessages, response];
                            setMessages(newMessages);
                            setMessageCount((prevCount: number) => prevCount + 1);
                            setLastMessage(null);
                            return newMessages;
                        }
                        return prevMessages;
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    function addFileClick(e: any) {
        let input: HTMLInputElement = document.createElement("input");
        let countFiles = files.length;

        input.type = "file";
        input.multiple = true;

        input.addEventListener("change", function () {
            if (input.files) {
                for (let i = 0; i < input.files.length; i++) {
                    const file = input.files[i];
                    if (file) {
                        if (countFiles < 3) {
                            countFiles++;
                            setFiles((prevFiles) => [...prevFiles, file]);
                            console.log(file);
                        } else {
                            break;
                        }
                    }
                }
            }
        });

        input.remove();
        input.click();
    }

    function cleanPaste(e: any) {
        const target: HTMLDivElement | null = document.querySelector("div." + styles.ChatInput);
        if (!target) return 0;
        e.stopPropagation();
        e.preventDefault();

        const range = document.createRange();
        const selection = window.getSelection();

        const pasteData: DataTransfer | null = e.clipboardData;

        const cleanDataText: string | undefined = pasteData?.getData("text");
        if (cleanDataText) {
            target.innerText = target.innerText.trim() + cleanDataText.trim();

            range.selectNodeContents(target);
            range.collapse(false);

            selection?.removeAllRanges();
            selection?.addRange(range);

            target.focus();
            target.scrollTop = target.scrollHeight;

            setInput(target.innerText.trim());
            return;
        }

        const checkFiles: DataTransferItemList | undefined = pasteData?.items;
        if (checkFiles) {
            for (let i = 0; i < checkFiles.length; i++) {
                if (i > 3) {
                    break;
                }
                const file = checkFiles[i].getAsFile();
                if (file) {
                    if (files.length < 3) {
                        setFiles((prevFiles) => [...prevFiles, file]);
                    }
                }
            }
        }
    }

    useEffect(() => {
        function targetInput(e: KeyboardEvent) {
            const inputDiv: HTMLDivElement | null = document.querySelector("div." + styles.ChatInput);
            const focusedElement = document.activeElement;

            if (
                e.ctrlKey ||
                e.altKey ||
                e.key == "Escape" ||
                e.key == "PageUp" ||
                e.key == "PageDown" ||
                e.key == "End" ||
                editMessage != null ||
                showSettings ||
                editingInput
            )
                return 0;

            if (focusedElement != inputDiv) {
                if (inputDiv) {
                    const range = document.createRange();
                    const selection = window.getSelection();

                    range.selectNodeContents(inputDiv);
                    range.collapse(false);

                    selection?.removeAllRanges();
                    selection?.addRange(range);

                    inputDiv.focus();
                    inputDiv.scrollTop = inputDiv.scrollHeight;
                }
            }
        }

        document.addEventListener("keydown", targetInput);

        return () => {
            document.removeEventListener("keydown", targetInput);
        };
    }, [editMessage, showSettings, editingInput]);

    return (
        <>
            {files.length > 0 && (
                <>
                    <div
                        className={styles.filesContainer}
                        style={{
                            borderBottomLeftRadius: files.length > 0 ? "0px" : "",
                            borderBottomRightRadius: files.length > 0 ? "0px" : "",
                        }}
                    >
                        {files.map((file: any, index: number) => {
                            return (
                                <div key={index} className={styles.fileItem}>
                                    <span
                                        className={styles.removeIcon}
                                        onClick={(e) => {
                                            setFiles((prevFiles: any) =>
                                                prevFiles.filter((ficheiro: any) => ficheiro !== file)
                                            );
                                        }}
                                    >
                                        <TrashBin />
                                    </span>
                                    <TypeIcon file={files[index]} />
                                    <hr />
                                    <p>{files[index].name}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div
                className={styles.ChatInputContainer}
                style={{
                    borderTopLeftRadius: files.length > 0 ? "0px" : "",
                    borderTopRightRadius: files.length > 0 ? "0px" : "",
                }}
            >
                <div className={styles.iconsContainer}>
                    <span onClick={addFileClick} style={{ display: "inline-block", height: "max-content" }}>
                        <AddFileIcon />
                    </span>
                </div>
                <div
                    spellCheck={input === "" ? false : true}
                    className={styles.ChatInput}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e: any) => {
                        setInput(e.target.innerText.trim());
                    }}
                    onKeyDown={(e: any) => {
                        if ((e.code === "Enter" || e.code === "NumpadEnter") && !e.shiftKey) {
                            e.stopPropagation();
                            e.preventDefault();
                            if (files.length > 0 || input !== "") {
                                sendMessage();
                                setInput("");
                                setFiles([]);

                                const inputDiv: HTMLDivElement | null = document.querySelector(
                                    "div." + styles.ChatInput
                                );

                                if (inputDiv) {
                                    inputDiv.innerText = `Enviar mensagem para ${
                                        headerInfo.username || headerInfo.chatName
                                    }`;
                                    inputDiv.blur();
                                }
                            }
                        }
                    }}
                    onPaste={(e: any) => cleanPaste(e)}
                    onFocus={(e: any) => {
                        if (input === "<br>" || input === "") e.target.innerText = "";
                    }}
                    onBlur={(e: any) => {
                        if (input === "<br>" || input === "")
                            e.target.innerText = `Enviar mensagem para ${
                                headerInfo.username ? headerInfo.username : headerInfo.chatName
                            }`;
                    }}
                >
                    Enviar mensagem para {headerInfo.username ? headerInfo.username : headerInfo.chatName}
                </div>
                <div
                    className={styles.iconsContainer}
                    onClick={(e: any) => {
                        if (files.length > 0 || input !== "") {
                            sendMessage();
                            setInput("");
                            setFiles([]);

                            const inputDiv: HTMLDivElement | null = document.querySelector("div." + styles.ChatInput);

                            if (inputDiv) {
                                //@ts-ignore
                                inputDiv.innerText = `Enviar mensagem para ${
                                    headerInfo.username ? headerInfo.username : headerInfo.chatName
                                }`;
                            }
                        }
                    }}
                >
                    <SendIcon stroke={files.length > 0 || input !== "" ? 1 : 0} />
                </div>
            </div>
        </>
    );
}
