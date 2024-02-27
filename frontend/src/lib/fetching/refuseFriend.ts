export async function refuseFriend(memberId: string) {
    const serverIp = process.env.serverIp;

    const response = await fetch(serverIp + "/user/refuseRequest?userId=" + memberId, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        redirect: "manual",
    });

    const result_1 = await response.json();

    return result_1.memberId;
}
