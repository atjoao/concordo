import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import ItemComponent from "./ItemComponent";
import { useContext, useEffect, useState } from "react";
import { LayoutCached } from "@/app/app/layout";
import { checkDb_user } from "@/lib/fetching/getChatName";

export default function BlockedTab() {
    const { serverIp, blocked, set_blocked }: any = useContext(LayoutCached);

    const [loaded, setLoaded] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (blocked == null) {
            setLoading(false);
        }

        if (blocked != null) {
            const loadBlocked = async () => {
                const loadedInfo = await Promise.all(
                    blocked.map(async (person: string) => {
                        const resp = await checkDb_user(person, String(serverIp), false);
                        return resp;
                    })
                );

                setLoaded(loadedInfo);
                setLoading(false);
            };

            loadBlocked();
        }
    }, [blocked]);

    return (
        <>
            {loading ? (
                <p>A carregar</p>
            ) : loaded && loaded.length > 0 ? (
                loaded.map((blockedUser: User) => (
                    <ItemComponent
                        key={blockedUser.id}
                        nome={blockedUser.username}
                        descrim={blockedUser.descrim}
                        id={blockedUser.id}
                        avatar={blockedUser.avatar}
                        itemType="blocked"
                        blocklist={blocked}
                        set_blocklist={set_blocked}
                    />
                ))
            ) : (
                <p>Sem pessoas bloqueadas</p>
            )}
        </>
    );
}
