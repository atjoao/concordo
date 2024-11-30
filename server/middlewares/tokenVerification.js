import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../schemas/user/User.js";

// eu ns pq isto ta a ser lido primeiro mas ok
// pq raios eu fiz isto?

let IV, KEY;
try {
    IV = Buffer.from(process.env.IV_KEY, "hex");
    KEY = Buffer.from(process.env.SECRET_KEY, "hex");
} catch (error) {
    console.log(error);
}

/**
 * @param {import('socket.io').Socket} socket
 * @param { function } next
 */
export default async function (socket, next) {
    let { token } = socket.handshake.auth;

    if (!token) {
        throw new Error("TOKEN_NOT_DETECTED");
    }

    try {
        token = Buffer.from(token, "hex");

        const decipherToken = crypto.createDecipheriv(process.env.KEY_ALGORITHM, KEY, IV);

        let decryptedToken = decipherToken.update(token);
        decryptedToken = Buffer.concat([decryptedToken, decipherToken.final()]);

        token = decryptedToken.toString();

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (!decoded.id || !decoded.password || !decoded.email) {
            throw new Error("INVALID_TOKEN");
        }

        const user = await User.findById(decoded.id);
        if (!user) throw new Error("INVALID_TOKEN");
        if (user.email != decoded.email) throw new Error("INVALID_TOKEN");

        const compararPassword = bcrypt.compareSync(decoded.password, user.password);

        if (!compararPassword) throw new Error("INVALID_TOKEN");

        if (user.suspender && !user.admin) throw new Error("INVALID_TOKEN");

        socket.data.userId = user._id.toString();
        next();
    } catch (error) {
        next(error);
    }
}