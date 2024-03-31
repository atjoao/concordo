import { useContext, useEffect, useState } from "react";
import styles from "./ChatHeader.module.css";
import { LayoutCached } from "@/app/app/layout";
import { useLiveQuery } from "dexie-react-hooks";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { checkDb_user } from "@/lib/fetching/getChatName";

export default function ChatHeader({ headerInfo }: any) {
    const { serverIp }: any = useContext(LayoutCached);
    const friend = useLiveQuery(() => _userInfoDb.user.get(headerInfo.id));

    const [user, setUser] = useState<User>({
        id: "",
        descrim: "",
        username: "",
        avatar: "",
        online: 0,
    });

    useEffect(() => {
        checkDb_user(headerInfo.id, serverIp, false).then((t: any) => {
            return setUser(t);
        });
    }, [friend]);

    return (
        <>
            <div className={styles.chatHeader}>
                {user && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img src={serverIp + "/avatar/" + user?.avatar} alt={"Avatar de " + user?.username} />
                        <div className={styles.userInfo}>
                            <p>{user?.username}</p>
                            <p>{user?.online ? "🟢 Online" : "⚫ Offline"}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
