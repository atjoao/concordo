import { useContext } from "react";
import FileRender from "../FileRender";
import styles from "./InitialMessage.module.css";
import ErroImage from "@/assets/images/main/erro.png";
import ThreeDotsIcon from "@/components/icons/ThreeDotsIcon";
import { LayoutCached } from "@/app/app/layout";
import { ChatMessagesContext } from "@/app/app/chat/[chatId]/page";

export default function InitialMessage({
    serverIp,
    message,
    chatId,
    user,
    convertReadableHourAndDate,
    currentToolbox,
    setCurrentToolbox,
    profile,
    apagarMessagem,
    editMessage,
    setEditMessage,
    messageEdited,
    sendEditMessage,
}: any) {
    const { photo }: any = useContext(LayoutCached);

    const { setMessages, setMessageCount }: any = useContext(ChatMessagesContext);
    const isEditing = editMessage === message._id;

    const formatMessage = (message: string): JSX.Element => {
        const urlRegex = /^(https?:\/\/[^\s]+)/g;
        const italicRegex = /_([^_]+)_/g;
        const boldRegex = /\*([^*]+)\*/g;

        const formattedMessage = message
            .replace(urlRegex, (match) => `<a href="${encodeURI(match)}">${match}</a>`)
            .replace(italicRegex, (match, content) => `<i>${content}</i>`)
            .replace(boldRegex, (match, content) => `<b>${content}</b>`);

        return (
            <div
                style={{
                    display: "block",
                }}
                dangerouslySetInnerHTML={{ __html: formattedMessage }}
            />
        );
    };

    const handleToggleToolbox = () => {
        if (currentToolbox !== message._id) {
            setCurrentToolbox(message._id);
        } else {
            setCurrentToolbox(null);
        }
    };

    const handleDeleteMessage = () => {
        apagarMessagem(message);
    };

    if (user === "error") {
        return (
            <div className={styles.initialMessage + " " + styles.ajdMsg} key={message._id} data-messageid={message._id}>
                <div className={styles.messageUserinfo}>
                    <img src={ErroImage.src} alt={"Esta messagem não pode ser enviada"} />
                </div>
                <div className={styles.InitMsgcontent}>
                    <div>
                        <span>Ajudante</span>
                        <span className={styles.time}>{convertReadableHourAndDate(message.createdAt)}</span>
                    </div>
                    <span>{message.content}</span>
                    <div
                        className={styles.remover}
                        onClick={() => {
                            setMessageCount((prevCount: number) => {
                                return prevCount - 1;
                            });
                            setMessages((msg: any[]) => {
                                return msg.filter((msgFilter: any) => msgFilter._id !== message._id);
                            });
                        }}
                    >
                        <span>Remover messagem</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles.initialMessage}
            data-messageid={message._id}
            key={message._id}
            onMouseLeave={() => setCurrentToolbox(null)}
            style={{
                opacity: message._id.startsWith("temp_") ? 0.5 : 1,
            }}
        >
            <div className={styles.messageUserinfo}>
                <img
                    src={
                        user.id === profile.info.id
                            ? photo
                                ? URL.createObjectURL(photo)
                                : serverIp + "/avatar/" + profile.info.id
                            : serverIp + "/avatar/" + user.avatar
                    }
                    alt={"Avatar de " + user.username}
                />
            </div>

            {(message.content || user.id === profile.info.id) && (
                <div
                    className={`${styles.options} ${
                        currentToolbox === message._id ? "" : isEditing ? styles.hidden : ""
                    }`}
                    onClick={handleToggleToolbox}
                >
                    {currentToolbox === message._id && (
                        <div className={styles.toolbox}>
                            {message.content && (
                                <span onClick={() => navigator.clipboard.writeText(message.content)}>
                                    Copiar mensagem
                                </span>
                            )}

                            {user.id === profile.info.id && (
                                <>
                                    <span
                                        onClick={() => {
                                            setEditMessage(message._id);
                                            setTimeout(() => {
                                                document.querySelector("#currentEditMessage")?.scrollIntoView();
                                            }, 50);
                                        }}
                                    >
                                        Editar mensagem
                                    </span>
                                    <span className={styles.delete} onClick={handleDeleteMessage}>
                                        Apagar mensagem
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    <ThreeDotsIcon />
                </div>
            )}

            <div className={styles.InitMsgcontent}>
                <div>
                    <span>{user.id === profile.info.id ? profile.info.username : user.username}</span>
                    <span className={styles.time}>{convertReadableHourAndDate(message.createdAt)}</span>
                </div>

                {(message.content || isEditing) && (
                    <div className={styles.InitMsgcontent}>
                        {isEditing ? (
                            <div
                                className={styles.editingContainer}
                                onKeyDown={(e: any) => {
                                    if (e.code === "Enter" && !e.shiftKey) {
                                        e.stopPropagation();
                                        e.preventDefault();

                                        sendEditMessage(message);
                                    }

                                    if (e.code === "Escape") {
                                        setEditMessage(null);
                                    }
                                }}
                            >
                                <div
                                    id="currentEditMessage"
                                    className={styles.editingMessage}
                                    contentEditable={true}
                                    onPaste={(e: any) => {
                                        e.preventDefault();

                                        if (e.target.innerText.length > 1024) return;

                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        const pasteData: DataTransfer | null = e.clipboardData;
                                        const cleanDataText: string | undefined = pasteData?.getData("text");

                                        if (cleanDataText) {
                                            e.target.innerText = e.target.innerText.trim() + cleanDataText.trim();

                                            range.selectNodeContents(e.target);
                                            range.collapse(false);

                                            selection?.removeAllRanges();
                                            selection?.addRange(range);

                                            e.target.focus();
                                            e.target.scrollTop = e.target.scrollHeight;
                                        }
                                    }}
                                    onFocus={(e: any) => {
                                        if (e.target.innerHTML === "<br>" || e.target.innerText === "") {
                                            e.target.innerHTML = "&nbsp;";
                                            return;
                                        }
                                    }}
                                    onInput={(e: any) => {
                                        if (e.target.innerHTML === "<br>" || e.target.innerText === "") {
                                            e.target.innerHTML = "&nbsp;";
                                            return;
                                        }
                                        if (e.target.innerText.length > 1024) return;
                                    }}
                                >
                                    {message.content}
                                </div>
                                <div className={styles.buttons}>
                                    <p>
                                        Enter para <span onClick={() => sendEditMessage(message)}>salvar</span>
                                    </p>
                                    <p>
                                        Esc para <span onClick={() => setEditMessage(null)}>cancelar</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <span>
                                {formatMessage(message.content)}
                                {messageEdited && <span className={styles.msgEdited}>(editado)</span>}
                            </span>
                        )}
                    </div>
                )}

                {message.filesAnexed &&
                    message.filesAnexed.map((file: any, index: number) => {
                        return (
                            <div className={styles.files} key={index}>
                                <FileRender
                                    file_blob={file}
                                    file_url={serverIp + "/download/" + chatId + "/" + file.file_id}
                                    file_name={file.file_name}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
