import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { useLiveQuery } from "dexie-react-hooks";
import ItemComponent from "./ItemComponent";

import sadface from "@/assets/images/main/sad-face.png";

export default function AllFriendsOnlineTab() {
    const friends = useLiveQuery(() => _userInfoDb.user.where("online").equals(1).toArray());

    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                height: friends && friends.length > 0 ? "auto" : "100%",
                alignItems: friends && friends.length > 0 ? "" : "center",
                justifyContent: friends && friends.length > 0 ? "" : "center",
                gap: 10,
                flexDirection: "column",
            }}
        >
            {friends && friends?.length > 0 ? (
                friends?.map((friend: User) => (
                    <ItemComponent
                        key={friend.id}
                        nome={friend.username}
                        descrim={friend.descrim}
                        id={friend.id}
                        avatar={friend.avatar}
                        online={friend.online}
                        itemType="friend"
                    />
                ))
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <img src={sadface.src} alt="Ninguem online" style={{ filter: "grayscale(1)" }} />
                    <p>Ninguem online para falar</p>
                </div>
            )}
        </div>
    );
}
