import { Socket, io } from "socket.io-client";

export let socket: Socket | null = null;

async function client(token: String = "", serverIp: String = ""): Promise<Socket> {
    return new Promise<Socket>((resolve, reject) => {
        if (!socket) {
            socket = io(`//${serverIp}`, {
                auth: {
                    token: token,
                },
                reconnection: true,
                reconnectionDelay: 500,
                reconnectionDelayMax: 30000,
            });

            socket.on("connect", () => {
                console.log("yep");
                // @ts-ignore
                resolve(socket);
            });
        }

        resolve(socket);
    });
}

export default client;
