import { checkDb_user } from "./getChatName";

export async function acceptFriend(memberId: string) {
    const serverIp = process.env.serverIp;

    const response = await fetch(serverIp + "/user/acceptRequest?userId=" + memberId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        redirect: "manual",
    });

    const result_1 = await response.json();
    await checkDb_user(memberId, String(serverIp), true);
    return result_1.memberId;
}
