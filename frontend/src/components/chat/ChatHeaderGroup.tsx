import { useContext, useEffect, useState } from "react";
import styles from "./ChatHeader.module.css";
import formbtn from "./formbtn.module.css";
import { LayoutCached } from "@/app/app/layout";
import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import AddFriendIcon from "../icons/AddFriendIcon";
import { createPortal } from "react-dom";
import DialogBase from "../dialogs/DialogBase";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatMessagesContext } from "@/app/app/chat/[chatId]/page";

export default function ChatHeaderGroup({ headerInfo, chatId }: { headerInfo: any; chatId: string }) {
    const { profile, serverIp }: any = useContext(LayoutCached);
    const { editingInput, setEditingInput }: any = useContext(ChatMessagesContext);

    const friends = useLiveQuery(() => _userInfoDb.user.toArray());

    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);

    return (
        <>
            <div className={styles.chatHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                        src={serverIp + "/getGroupProfile/" + headerInfo.chatAvatar}
                        alt={"Avatar de grupo"}
                        onClick={() => {
                            if (headerInfo.chatOwnerId !== profile.info.id) return;
                            let input: HTMLInputElement = document.createElement("input");
                            input.type = "file";
                            input.multiple = false;
                            input.accept = "image/*";
                            input.addEventListener("change", function () {
                                if (input.files) {
                                    const selectedImage = input.files[0];
                                    if (selectedImage) {
                                        const form = new FormData();
                                        form.append("avatar", selectedImage, selectedImage.name);
                                        fetch(serverIp + "/chat/grupo/" + chatId + "/change", {
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                            method: "POST",
                                            body: form,
                                        });
                                    }
                                }
                            });
                            input.remove();
                            input.click();
                        }}
                    />
                    <div className={styles.userInfo}>
                        <div
                            contentEditable={headerInfo.chatOwnerId === profile.info.id}
                            suppressContentEditableWarning={true}
                            onFocus={() => setEditingInput(true)}
                            onBlur={(e) => {
                                setEditingInput(false);
                                const target: HTMLInputElement = e.target as HTMLInputElement;

                                if (target.innerText == headerInfo.chatName) return;

                                const form = new FormData();

                                form.append("groupname", target.innerText);
                                fetch(serverIp + "/chat/grupo/" + chatId + "/change", {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                    method: "POST",
                                    body: form,
                                }).then((r) => {
                                    if (r.status == 400 || r.status == 404 || r.status == 500) {
                                        target.innerText = headerInfo.chatName;
                                        return;
                                    }
                                });
                            }}
                            // no way this is a valid type... its so stupid
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                const target: HTMLInputElement = e.target as HTMLInputElement;
                                if (e.key === "Escape") {
                                    target.value = headerInfo.chatName;
                                    setEditingInput(false);
                                    target.blur();
                                }

                                if (e.key == "Enter") {
                                    setEditingInput(false);
                                    target.blur();
                                }

                                if (target.innerText.length > 49) {
                                    if (e.key == "Backspace" || e.ctrlKey || e.altKey) {
                                        return;
                                    }
                                    e.preventDefault();
                                }
                            }}
                        >
                            {headerInfo.chatName}
                        </div>
                        <p>Membros: {headerInfo.members_id.length}</p>
                    </div>
                </div>
                {headerInfo.chatOwnerId === profile.info.id && (
                    <div className={styles.addMember}>
                        <span
                            onClick={() => {
                                if (headerInfo.chatOwnerId !== profile.info.id) return;
                                setOpenMenu(!openMenu);
                            }}
                        >
                            <AddFriendIcon height="24px" />
                        </span>
                        {openMenu &&
                            createPortal(
                                <DialogBase
                                    title={"Adicionar amigos ao grupo"}
                                    cancelAction={() => {
                                        setOpenMenu(!openMenu);
                                        setSelectedUsers([]);
                                    }}
                                    submitActionName={"Adicionar ao grupo"}
                                    color={String(true)}
                                    submitAction={async () => {
                                        // fazer isto
                                        if (selectedUsers.length == 0) {
                                            return;
                                        }

                                        setOpenMenu(!openMenu);
                                        setSelectedUsers([]);

                                        const data = {
                                            memberIds: selectedUsers.map((user) => user.id),
                                        };
                                        await fetch(serverIp + "/chat/grupo/" + chatId + "/addMember", {
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                            body: JSON.stringify(data),
                                            method: "POST",
                                            redirect: "manual",
                                        });
                                    }}
                                >
                                    {selectedUsers.length > 0 && (
                                        <div style={{ paddingBottom: "5px" }} className={formbtn.selectedUsers}>
                                            <p>Pessoas selecionadas:</p>

                                            <div>
                                                {selectedUsers.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => {
                                                            setSelectedUsers((users) => {
                                                                return users.filter(
                                                                    (userfilter) => userfilter.id !== user.id
                                                                );
                                                            });
                                                        }}
                                                    >
                                                        {user.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className={formbtn.friendsList}>
                                        {friends &&
                                            friends?.length > 0 &&
                                            friends?.map((friend: User) => (
                                                <label
                                                    className={formbtn.friendsListLabel}
                                                    key={friend.id}
                                                    style={{
                                                        opacity: headerInfo.members_id.some(
                                                            (user: string) => user === friend.id
                                                        )
                                                            ? 0.5
                                                            : "",
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        readOnly={true}
                                                        disabled={headerInfo.members_id.some(
                                                            (user: string) => user === friend.id
                                                        )}
                                                        checked={selectedUsers.some((user) => user.id === friend.id)}
                                                        onClick={() => {
                                                            if (headerInfo.members_id.includes(friend.id)) return;

                                                            setSelectedUsers((users) => {
                                                                if (users.some((user) => user.id === friend.id)) {
                                                                    return users.filter(
                                                                        (user) => user.id !== friend.id
                                                                    );
                                                                } else {
                                                                    return [
                                                                        ...users,
                                                                        {
                                                                            id: friend.id,
                                                                            name: `${friend.username}#${friend.descrim}`,
                                                                        },
                                                                    ];
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                        <img
                                                            src={serverIp + "/avatar/" + friend.avatar}
                                                            alt={"Avatar de " + friend.username}
                                                        />
                                                        <p>
                                                            {friend.username}#{friend.descrim}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                    </div>
                                </DialogBase>,
                                //@ts-ignore
                                document.getElementById("appMount")
                            )}
                    </div>
                )}
            </div>
        </>
    );
}
