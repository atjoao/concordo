if (!process.env.MONGO_URI || !process.env.SECRET_KEY || !process.env.IV_KEY || !process.env.SOCKET_TOKEN) {
    console.log("\x1b[41m[ERRO (.env)]\x1b[0m \x1b[37m Defina variaveis \x1b[0m");
    process.exit(0);
}

import { Server } from "socket.io";
import mongoose from "mongoose";
import mainSocketHandler from "./namespaces/main/main.js";
import adminSocketHandler from "./namespaces/admin/admin.js";
import functions from "./functions/functions.js";

/**
 * Especificar que é server wow
 * @type {import("socket.io").Server}
 */
const io = new Server({
    cors: {
        origin: "*",
    },
});

mainSocketHandler(io);
adminSocketHandler(io);

mongoose
    .connect(`${process.env.MONGO_URI}`)
    .then(() => {
        console.log(`\x1b[42m[INFO]\x1b[0m Ligado a database`);
        functions.setUsersOffline().then(() => {
            io.listen(process.env.PORT ? process.env.PORT : 3001);
            console.log(`\x1b[42m[INFO]\x1b[0m Server inciado na porta ${process.env.PORT ? process.env.PORT : 3001}`);
        });
    })
    .catch((err) => {
        console.log("\x1b[41m[ERRO]\x1b[0m Erro na ligação\x1b[0m");
        console.log(err);
        process.exit(0);
    });
