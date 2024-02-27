import { useContext } from "react";
import styles from "./ChatHeader.module.css";
import { LayoutCached } from "@/app/app/layout";
import { useLiveQuery } from "dexie-react-hooks";
import _userInfoDb from "@/lib/database/dbuserInfo";

export default function ChatHeader({ headerInfo }: any) {
    const { serverIp }: any = useContext(LayoutCached);
    const friend = useLiveQuery(() => _userInfoDb.user.get(headerInfo.id));

    return (
        <>
            <div className={styles.chatHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={serverIp + "/avatar/" + friend?.avatar} alt={"Avatar de " + friend?.username} />
                    <div className={styles.userInfo}>
                        <p>{friend?.username}</p>
                        <p>{friend?.online ? "🟢 Online" : "⚫ Offline"}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
