import { useContext } from "react";
import styles from "./ChatStart.module.css";
import { ChatMessagesContext } from "@/app/app/chat/[chatId]/page";

export default function ChatStart({ serverIp }: any) {
    const { headerInfo }: any = useContext(ChatMessagesContext);
    return (
        <div className={styles.chatStart}>
            {headerInfo.chatType === "GP" ? (
                <>
                    <img
                        src={`${serverIp}/getGroupProfile/${headerInfo.avatar}`}
                        alt={"Avatar de " + headerInfo.username}
                    />

                    <p>{headerInfo.chatName}</p>
                    <p>
                        Inicio de conversas em <strong>{headerInfo.chatName}</strong>
                    </p>
                </>
            ) : (
                <>
                    <img src={`${serverIp}/avatar/${headerInfo.avatar}`} alt={"Avatar de " + headerInfo.username} />
                    <p>
                        {headerInfo.username}#{headerInfo.descrim}
                    </p>
                    <p>
                        Inicio de conversas com <strong>{headerInfo.username}</strong>
                    </p>
                </>
            )}
        </div>
    );
}
