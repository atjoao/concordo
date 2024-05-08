if (
    !process.env.MONGO_URI ||
    !process.env.SECRET_KEY ||
    !process.env.IV_KEY ||
    (process.env.VERIFICATION == "true" &&
        (!process.env.EMAIL_SMTP_SERVER ||
            !process.env.EMAIL_SMTP_PORT ||
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASSWORD ||
            !process.env.SOCKET_TOKEN))
) {
    console.log(
        "\x1b[41m[ERRO (.env)]\x1b[0m \x1b[37m Defina variaveis \x1b[0m"
    );
    process.exit(0);
}

import Express from "express";
import "express-async-errors";
//import slowDown from "express-slow-down";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import cors from "cors";
//importar routes
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import filesRoute from "./routes/filesRoutes.js";
import messagesRoute from "./routes/messagesRoute.js";
import tokenVerification from "./middleware/tokenVerification.js";
import client from "./util/socketClient.js";
import countUsers from "./util/countUsers.js";

let adminRouting = null;
if (process.env.ADMIN_PANEL === "true") {
    await import("./admin/adminRouting.js").then(
        (adm) => (adminRouting = adm.default)
    );
}

import stats from "./util/utilstats.js";
import setAdminUser from "./util/setAdminUser.js";

const app = Express();
export let ffmpegDetect = false;

app.use(Express.json());

app.use(cors({ origin: "*" }));

app.use(
    fileUpload({
        limits: { fileSize: 20 * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res) => {
            return res.status(500).json({
                message: "Os teus ficheiros são demasiado grandes",
                status: "BIG_FILE",
            });
        },
    })
);

app.use("/auth", authRoute);
app.use("/user", tokenVerification, userRoute);
app.use("/chat", tokenVerification, messagesRoute);
app.use("/", filesRoute);

if (process.env.ADMIN_PANEL === "true") app.use("/admin", adminRouting);

// Error handling
app.use((err, req, res, next) => {
    console.log(err);
    if (err.type == "entity.parse.failed") {
        return res.status(500).json({
            message: "Ocorreu um erro ao obeter dados json",
        });
    }

    if (!err.code || err.code == "ERR_HTTP_HEADERS_SENT") {
        return 0;
    }

    return res.status(500).json({
        message: "Server Error",
    });
});

// hwoww world
app.get("/", (req, res) => {
    res.status(200).json({ hello: "world" });
});

app.get("/info", async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=1800");
    return res.status(200).json({
        connected: client.connected,
        users: countUsers.getRegistredUsers(),
        address:
            process.env.npm_lifecycle_event === "dev"
                ? "127.0.0.1:3001"
                : process.env.SOCKET_URL,
        account_verification: process.env.VERIFICATION,
    });
});

mongoose
    .connect(`${process.env.MONGO_URI}`)
    .then(() => {
        console.log(`\x1b[42m[INFO]\x1b[0m Ligado a database`);
        if (process.env.FFPROBE_PATH && process.env.FFMPEG_PATH) {
            ffmpegDetect = true;
            console.log("\x1b[42m[INFO]\x1b[0m FFMPEG detetado");
        } else {
            process.env.PATH.split(";").map((entry) => {
                if (entry.toLocaleLowerCase().includes("ffmpeg")) {
                    ffmpegDetect = true;
                    console.log("\x1b[42m[INFO]\x1b[0m FFMPEG detetado");
                }
            });
        }

        if (!ffmpegDetect)
            console.log("\x1b[41m[ERRO]\x1b[0m FFMPEG não detectado \x1b[0m");
        stats.start();
        client.connect();
        countUsers.start();
        if (process.env.ADMIN_PANEL === "true") setAdminUser();
        app.listen(process.env.PORT ? process.env.PORT : 3000, function () {
            console.log(
                `\x1b[42m[INFO]\x1b[0m Server inciado na porta ${
                    this.address().port
                }`
            );
        });
    })
    .catch((err) => {
        console.log("\x1b[41m[ERRO]\x1b[0m Erro na ligação\x1b[0m");
        console.log(err);
        process.exit(0);
    });
