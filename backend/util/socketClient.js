import { io } from "socket.io-client";

let tryingReconnection = false;

const client = io(
    `ws://127.0.0.1:${
        process.env.SOCKET_PORT ? process.env.SOCKET_PORT : 3001
    }/admin`,
    {
        auth: {
            token: process.env.SOCKET_TOKEN,
        },
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 30000,
        autoConnect: false,
    }
);

client.on("connect", (socket) => {
    console.log(`\x1b[42m[INFO]\x1b[0m Ligado ao server`);
    tryingReconnection = false;
});

client.on("disconnect", (reason) => {
    console.log("\x1b[41m[AVISO]\x1b[0m Desconectei do servidor\x1b[0m");
    console.log("|---> ", reason);
});

client.on("connect_error", (error) => {
    if (!tryingReconnection) {
        console.log("\x1b[41m[ERRO]\x1b[0m Erro na ligação\x1b[0m");
        console.log("|---> ", error.message);
        tryingReconnection = true;
    }
});

export default client;
