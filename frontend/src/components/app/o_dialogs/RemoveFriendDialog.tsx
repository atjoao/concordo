import { LayoutCached } from "@/app/app/layout";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { use, useContext, useEffect, useState } from "react";

import styles from "./modal.module.css";
import { checkDb_user, removeFromCache } from "@/lib/fetching/getChatName";

function removeFriend(serverIp: string, userId: string) {
    fetch(serverIp + "/user/undoFriend?userid=" + userId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        redirect: "manual",
    })
        .then((response) => response.json())
        .then(async (resp) => {
            removeFromCache(userId);
            const user: User | undefined = await _userInfoDb.user.get(userId);

            if (user) {
                await _userInfoDb.user.update(userId, { online: 0 }).then(async () => {
                    await _userInfoDb.user.delete(userId);
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

export default function RemoveFriedDiaglog({ close, userId }: { close: () => void; userId: string }) {
    const { serverIp }: any = useContext(LayoutCached);

    const [loaded, setLoaded] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
            await checkDb_user(userId, serverIp, false).then((result) => {
                setLoaded(result);
            });
        };

        fetchData();
    }, []);

    return (
        <div className={styles.overlay}>
            {loaded && (
                <div className={styles.modal}>
                    <h1>Tirar {loaded.username}</h1>
                    <p className={styles.text}>
                        Vais tirar {loaded.username}#{loaded.descrim} da tua lista de amigos esta ação é irreversível
                    </p>
                    <div className={styles.buttons}>
                        <p onClick={close}>Cancelar</p>
                        <p
                            onClick={() => {
                                close();
                                removeFriend(serverIp, userId);
                            }}
                        >
                            Proceder
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
