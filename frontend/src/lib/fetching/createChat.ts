export async function createChat(memberId: string, userChats: any, setUserChats: any) {
    let response, result;
    const serverIp = process.env.serverIp;

    if (Array.isArray(memberId) && memberId.length >= 2) {
        const data = {
            memberIds: memberId.map((user) => user.id),
        };
        response = await fetch(serverIp + "/chat/criarGrupo/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            method: "POST",
            redirect: "manual",
        });
    } else {
        let membro = memberId;
        if (Array.isArray(memberId)) {
            membro = memberId[0].id;
        }
        response = await fetch(serverIp + "/chat/create/" + membro, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            redirect: "manual",
        });
    }

    if (response) {
        result = await response.json();

        if (!userChats.includes(result.chat_id)) {
            setUserChats([...userChats, result.chat_id]);
        }

        return result.chat_id;
    }
    return undefined;
}
