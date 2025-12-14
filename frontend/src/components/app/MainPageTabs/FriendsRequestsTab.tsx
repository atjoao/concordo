import { LayoutCached } from "@/app/app/layout";
import { User } from "@/lib/database/dbuserInfo";
import { checkDb_user } from "@/lib/fetching/getChatName";
import { useContext, useEffect, useState } from "react";
import ItemComponent from "./ItemComponent";

export default function FriendRequestsTab() {
    const { serverIp, f_requests, set_f_requests }: any = useContext(LayoutCached);

    const [loaded, setLoaded] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (f_requests == null) {
            setLoading(false);
        }

        if (f_requests != null) {
            const load_sent_requests = async () => {
                const loadedInfo = await Promise.all(
                    f_requests.map(async (person: string) => {
                        const resp = await checkDb_user(person, String(serverIp), false);
                        return resp;
                    })
                );

                setLoaded(loadedInfo);
                setLoading(false);
            };

            load_sent_requests();
        }
    }, [f_requests]);

    return (
        <>
            {loading ? (
                <p>A carregar</p>
            ) : loaded && loaded.length > 0 ? (
                loaded.map((friend: User) => (
                    <ItemComponent
                        key={friend.id}
                        nome={friend.username}
                        descrim={friend.descrim}
                        id={friend.id}
                        avatar={friend.avatar}
                        online={friend.online}
                        itemType="request_pending"
                        f_requests={f_requests}
                        set_f_requests={set_f_requests}
                    />
                ))
            ) : (
                <p>Nenhum pedido recebido</p>
            )}
        </>
    );
}
