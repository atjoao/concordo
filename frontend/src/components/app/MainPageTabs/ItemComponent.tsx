import RemoveIcon from "@/components/icons/RemoveIcon";
import styles from "./ItemComponent.module.css";
import ChatIcon from "@/components/icons/ChatIcon";
import CrossmarkIcon from "@/components/icons/CrossmarkIcon";
import CheckmarkIcon from "@/components/icons/CheckmarkIcon";
import { useRouter } from "next/navigation";
import { createChat } from "@/lib/fetching/createChat";
import { useContext, useState } from "react";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { createPortal } from "react-dom";
import RemoveFriedDiaglog from "../o_dialogs/RemoveFriendDialog";

import { checkDb_user, removeFromCache } from "@/lib/fetching/getChatName";
import { acceptFriend } from "@/lib/fetching/acceptFriend";
import { refuseFriend } from "@/lib/fetching/refuseFriend";
import { removeRequest } from "@/lib/fetching/removeRequest";

import { LayoutCached } from "@/app/app/layout";
import BlockedIcon from "@/components/icons/BlockedIcon";
import DialogBase from "@/components/dialogs/DialogBase";
import { removeBlock } from "@/lib/fetching/removeBlock";

export default function ItemComponent({
    nome,
    descrim,
    id,
    avatar,
    online,
    itemType,
    set_f_requests,
    f_requests,
    sent_requests,
    blocklist,
    set_blocklist,
    set_sent_requests,
}: any) {
    const router = useRouter();
    const [removeDialog, setRemoveDialog] = useState<boolean>(false);
    const [blockDialog, setBlockDialog] = useState<boolean>(false);

    const { serverIp, userChats, setUserChats }: any = useContext(LayoutCached);
    return (
        <div className={styles.container} data-userid={id} data-itemtype={itemType}>
            <img src={serverIp + "/avatar/" + avatar} alt={"Avatar de " + nome} />
            <div>
                <p>
                    {String(nome)}#{descrim}
                </p>

                <>
                    {itemType == "friend" && (online === 1 ? <p>🟢 Online</p> : <p>⚫ Offline</p>)}
                    {itemType == "request_pending" && <p>Pedido por aceitar</p>}
                    {itemType == "request_sent" && <p>Pedido enviado</p>}
                    {itemType == "blocked" && <p>Bloqueado</p>}
                </>
            </div>
            <>
                {itemType == "friend" && (
                    <div className={styles.buttons}>
                        <span
                            onClick={async () => {
                                const chatId = await createChat(id, userChats, setUserChats);
                                if (chatId) {
                                    router.push("/app/chat/" + chatId, undefined);
                                }
                            }}
                        >
                            <ChatIcon />
                        </span>

                        <span onClick={() => setRemoveDialog(true)}>
                            <RemoveIcon />
                        </span>
                        {removeDialog &&
                            createPortal(
                                <RemoveFriedDiaglog close={() => setRemoveDialog(false)} userId={id} />,
                                //@ts-ignore
                                document.getElementById("appMount")
                            )}

                        <span onClick={() => setBlockDialog(true)}>
                            <BlockedIcon />
                        </span>
                        {blockDialog &&
                            createPortal(
                                <DialogBase
                                    title={"Bloquear " + nome}
                                    description={
                                        "Vais tirar " +
                                        nome +
                                        "#" +
                                        descrim +
                                        " da tua lista de amigos esta ação é irreversível"
                                    }
                                    submitActionName={"Bloquear " + nome}
                                    submitAction={() => {
                                        fetch(serverIp + "/user/blockPerson?userid=" + id, {
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                                "Content-Type": "application/json",
                                            },
                                            method: "POST",
                                            redirect: "manual",
                                        })
                                            .then((response) => response.json())
                                            .then(async (resp) => {
                                                removeFromCache(id);
                                                const user: User | undefined = await _userInfoDb.user.get(id);

                                                if (user) {
                                                    await _userInfoDb.user.update(id, { online: 0 }).then(async () => {
                                                        await _userInfoDb.user.delete(id);
                                                        set_blocklist((blockList: any[]) => {
                                                            if (!blockList.includes(id)) {
                                                                return [id, ...blockList];
                                                            }
                                                            return blockList;
                                                        });
                                                        setBlockDialog(false);
                                                    });
                                                }
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                            });
                                    }}
                                    cancelAction={() => setBlockDialog(false)}
                                />,
                                //@ts-ignore
                                document.getElementById("appMount")
                            )}
                    </div>
                )}
                {itemType == "request_pending" && (
                    <div className={styles.buttons}>
                        <span
                            className={styles.hoverGreen}
                            onClick={async () => {
                                if (Array.isArray(f_requests)) {
                                    const updatedF_requests = f_requests.filter((requestId: any) => requestId !== id);
                                    set_f_requests(updatedF_requests);
                                    await acceptFriend(id);
                                }
                            }}
                        >
                            <CheckmarkIcon />
                        </span>
                        <span
                            className={styles.hoverRed}
                            onClick={async () => {
                                if (Array.isArray(f_requests)) {
                                    const updatedF_requests = f_requests.filter((requestId: any) => requestId !== id);
                                    set_f_requests(updatedF_requests);
                                    await refuseFriend(id);
                                }
                            }}
                        >
                            <CrossmarkIcon />
                        </span>
                    </div>
                )}
                {itemType == "request_sent" && (
                    <div className={styles.buttons}>
                        <span
                            onClick={async () => {
                                if (Array.isArray(sent_requests)) {
                                    const updatedSent_requests = sent_requests.filter(
                                        (requestId: any) => requestId !== id
                                    );
                                    set_sent_requests(updatedSent_requests);
                                    await removeRequest(id);
                                }
                            }}
                        >
                            <RemoveIcon />
                        </span>
                    </div>
                )}
                {itemType == "blocked" && (
                    <div className={styles.buttons}>
                        <span
                            onClick={async () => {
                                if (Array.isArray(blocklist)) {
                                    const updatedBlock_list = blocklist.filter((blockedUId: any) => blockedUId !== id);
                                    set_blocklist(updatedBlock_list);
                                    await removeBlock(id);
                                }
                            }}
                        >
                            <RemoveIcon />
                        </span>
                    </div>
                )}
            </>
        </div>
    );
}
