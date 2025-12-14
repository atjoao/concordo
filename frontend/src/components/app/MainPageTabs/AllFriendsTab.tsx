import _userInfoDb, { User } from "@/lib/database/dbuserInfo";
import { useLiveQuery } from "dexie-react-hooks";
import ItemComponent from "./ItemComponent";
import sadface from "@/assets/images/main/sad-face.png";

export default function AllFriendsTab() {
    const friends = useLiveQuery(() => _userInfoDb.user.toArray());

    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                height: friends && friends.length > 0 ? "auto" : "100%",
                flexDirection: "column",
                justifyContent: friends && friends.length > 0 ? "" : "center",
                gap: 10,
            }}
        >
            {friends && friends.length > 0 ? (
                friends.map(
                    (friend: User) =>
                        friend.id !== 0 && (
                            <ItemComponent
                                key={friend.id}
                                nome={friend.username}
                                descrim={friend.descrim}
                                id={friend.id}
                                avatar={friend.avatar}
                                online={friend.online}
                                itemType="friend"
                            />
                        )
                )
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    <img src={sadface.src} alt="Ninguem online" style={{ filter: "grayscale(1)" }} />
                    <p>Não tem amigos na lista</p>
                </div>
            )}
        </div>
    );
}
