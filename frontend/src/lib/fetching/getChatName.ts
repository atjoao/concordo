import _userInfoDb, { User } from "../database/dbuserInfo";

const cache: any = {};

export function removeFromCache(userId: string) {
    if (cache.hasOwnProperty(userId)) {
        delete cache[userId];
        return true;
    }
    return false;
}

export function checkDb_user(checkMember: string, serverIp: string, save: boolean): Promise<string> {
    return _userInfoDb.user
        .get(checkMember)
        .then((userInfo: User | undefined) => {
            if (!userInfo) {
                if (cache.hasOwnProperty(checkMember) && save == false) {
                    return cache[checkMember];
                }

                return fetch(serverIp + "/user/userinfo?userid=" + checkMember, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                })
                    .then((response) => response.json())
                    .then((resp) => {
                        if (save) {
                            const dataObj: User = {
                                id: resp.info.id,
                                descrim: resp.info.descrim,
                                username: resp.info.username,
                                avatar: resp.info.avatar,
                                online: resp.info.online,
                            };
                            _userInfoDb.user.put(dataObj);
                        }

                        cache[checkMember] = {
                            id: resp.info.id,
                            descrim: resp.info.descrim,
                            username: resp.info.username,
                            avatar: resp.info.avatar,
                            online: resp.info.online,
                        };

                        return resp.info;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                return userInfo;
            }
        })
        .catch((err) => {
            return fetch(serverIp + "/user/userinfo?userid=" + checkMember, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            })
                .then((response) => response.json())
                .then((resp) => {
                    cache[checkMember] = {
                        id: resp.info.id,
                        descrim: resp.info.descrim,
                        username: resp.info.username,
                        avatar: resp.info.avatar,
                        online: resp.info.online,
                    };

                    return resp.info;
                });
        });
}

export function getChatGroupName(groupId: string, serverIp: string) {
    fetch(serverIp + "/chat/getChatInfo/" + groupId)
        .then((response) => response.json())
        .then((resp) => console.log(resp));
}

export default function getChatName(
    chat_members: string[],
    chatType: string,
    fuserId: string,
    serverIp: string,
    chat: any
): Promise<React.ReactNode> {
    return new Promise((resolve, reject) => {
        if (chat_members.length == 2 && chatType === "PM") {
            const checkMember = chat_members.filter((userid: any) => userid !== fuserId).toString();

            checkDb_user(checkMember, serverIp, false)
                .then((returnValue) => {
                    resolve(returnValue);
                })
                .catch((error) => {
                    console.log(error);
                    reject("erro!");
                });
        }
        if (chatType == "GP") {
            resolve(chat);
        }
    });
}
