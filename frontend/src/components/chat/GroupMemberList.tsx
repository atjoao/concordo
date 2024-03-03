import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { checkDb_user } from "@/lib/fetching/getChatName";
import { IChat } from "@/lib/interfaces";
import { useLiveQuery } from "dexie-react-hooks";
import { useState, useEffect, useContext } from "react";
import styles from "./GroupMemberList.module.css";
import { LayoutCached } from "@/app/app/layout";
import CrownIcon from "../icons/CrownIcon";

import menuStyle from "./Menu.module.css";
import { createPortal } from "react-dom";
import DialogBase from "../dialogs/DialogBase";
import RemoveFriedDiaglog from "../app/o_dialogs/RemoveFriendDialog";

export default function GroupMemberList({ headerInfo, chatId }: { headerInfo: IChat; chatId: string }) {
    const [menu, setMenu] = useState<boolean>(false);
    const [removeFriendOverlay, setFriendOverlay] = useState<{ user: User | null }>({ user: null });

    const [menuInfo, setMenuInfo] = useState<{ x: number; y: number; user: User | null }>({
        x: 0,
        y: 0,
        user: null,
    });

    const { serverIp, profile, set_sent_requests, set_f_requests }: any = useContext(LayoutCached);
    const [userList, setUserList] = useState<User[]>([]);
    const friends = useLiveQuery(() => _userInfoDb.user.toArray());

    useEffect(() => {
        const fetchUserinfo = async () => {
            const userInfoPromises = headerInfo.members_id.map((member) => checkDb_user(member, serverIp, false));
            const userInfos: any = await Promise.all(userInfoPromises);
            setUserList(userInfos);
        };

        fetchUserinfo();
    }, [headerInfo, serverIp, friends]);

    useEffect(() => {
        if (menu) {
            const handleClick = () => {
                setMenu(false);
                setMenuInfo({
                    x: 0,
                    y: 0,
                    user: null,
                });
            };
            document.addEventListener("click", handleClick);
            return () => {
                console.log("remover evento ");
                document.removeEventListener("click", handleClick);
            };
        }
    }, [menu]);

    const isFriend = (userId: string): boolean => {
        if (!friends) return false;
        if (userId == profile.info.id) return true;
        return friends.some((friend) => friend.id === userId);
    };

    return (
        <div className={styles.gpListContainer}>
            <div>
                <p>Membros</p>
                <p>{headerInfo.members_id.length}</p>
            </div>
            {userList.map((userinfo, index) => {
                const coroa = userinfo.id == headerInfo.chatOwnerId;

                return (
                    <div
                        key={userinfo.id}
                        className={styles.gpListItem}
                        style={{ opacity: isFriend(userinfo.id) ? 1 : 0.5 }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setMenu(true);
                            setMenuInfo({ x: e.pageX, y: e.pageY, user: userinfo });
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setMenu(true);
                            setMenuInfo({ x: e.pageX, y: e.pageY, user: userinfo });
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            {coroa == true && <CrownIcon />}
                            <img src={serverIp + "/avatar/" + userinfo.id} alt={"Avatar de" + userinfo.username} />
                        </div>

                        <div>
                            <p>
                                {userinfo.username}#{userinfo.descrim}
                            </p>
                            {typeof userinfo.online == "number" && (
                                <p>{isFriend(userinfo.id) ? (userinfo?.online ? "🟢 Online" : "⚫ Offline") : ""}</p>
                            )}
                        </div>
                    </div>
                );
            })}

            {menu && profile.info.id != menuInfo.user?.id && (
                <div
                    style={{
                        top: menuInfo.y,
                        left: menuInfo.x,
                    }}
                    className={menuStyle.menu}
                >
                    <ul>
                        <li
                            onClick={async function () {
                                if (isFriend(menuInfo.user?.id)) {
                                    setFriendOverlay({ user: menuInfo.user });
                                    return;
                                }
                                const data = {
                                    username: menuInfo.user?.username,
                                    descrim: menuInfo.user?.descrim,
                                };

                                await fetch(serverIp + "/user/sendRequest", {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(data),
                                    method: "POST",
                                    redirect: "manual",
                                })
                                    .then((response) => response.json())
                                    .then((resp) => {
                                        if (resp.status == "sent") {
                                            set_sent_requests((sent_requests: any[]) => {
                                                if (!sent_requests.includes(resp.sentTo)) {
                                                    return [...sent_requests, resp.sentTo];
                                                }
                                                return sent_requests;
                                            });
                                        }
                                        if (resp.status == "accepted") {
                                            checkDb_user(resp.sentTo, String(serverIp), true);

                                            set_f_requests((f_requests: any[]) => {
                                                return f_requests.filter((requestId) => requestId !== resp.sentTo);
                                            });
                                        }
                                    });
                            }}
                        >
                            {isFriend(menuInfo.user?.id) ? "Remover amigo" : "Adicionar amigo"}
                        </li>
                        {profile.info.id == headerInfo.chatOwnerId && (
                            <li
                                className={menuStyle.red}
                                onClick={async function () {
                                    fetch(serverIp + "/chat/grupo/" + chatId + "/removeMember/" + menuInfo.user?.id, {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            "Content-Type": "application/json",
                                        },
                                    });
                                }}
                            >
                                Expulsar {menuInfo.user?.username}
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {removeFriendOverlay.user != null &&
                createPortal(
                    <RemoveFriedDiaglog
                        close={() => setFriendOverlay({ user: null })}
                        userId={removeFriendOverlay.user.id}
                    />,
                    //@ts-ignore
                    document.getElementById("appMount")
                )}
        </div>
    );
}
