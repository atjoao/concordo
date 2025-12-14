import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../schema/user/User.js";

const IV = Buffer.from(process.env.IV_KEY, "hex");
const KEY = Buffer.from(process.env.SECRET_KEY, "hex");

export default async function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(400).json({
            erro: "Token de autenticação inválida",
            status: "NO_TOKEN_HEADER",
        });
    }
    const headerAutenticao = req.headers.authorization.trim();

    if (!headerAutenticao || !headerAutenticao.split(" ")[1]) {
        return res.status(400).json({
            erro: "Token de autenticação inválida",
            status: "INVALID_TOKEN",
        });
    }

    if (headerAutenticao && headerAutenticao.startsWith("Bearer ")) {
        let token = headerAutenticao.split(" ")[1];
        if (!token)
            return res.status(400).json({
                erro: "Token de autenticação inválida",
                status: "INVALID_TOKEN",
            });

        try {
            token = Buffer.from(token, "hex");

            const decipherToken = crypto.createDecipheriv(
                process.env.KEY_ALGORITHM,
                KEY,
                IV
            );

            let decryptedToken = decipherToken.update(token);
            decryptedToken = Buffer.concat([
                decryptedToken,
                decipherToken.final(),
            ]);

            token = decryptedToken.toString();

            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            if (!decoded.id || !decoded.password || !decoded.email) {
                return res.status(400).json({
                    erro: "Token de autenticação inválida",
                    status: "INVALID_TOKEN",
                });
            }

            const user = await User.findById(decoded.id);
            if (!user)
                return res.status(401).json({
                    erro: "Token de autenticação inválida",
                    status: "INVALID_TOKEN",
                });

            if (user.email != decoded.email) {
                return res.status(401).json({
                    erro: "Token de autenticação inválida",
                    status: "INVALID_TOKEN",
                });
            }

            const compararPassword = bcrypt.compareSync(
                decoded.password,
                user.password
            );

            if (!compararPassword)
                return res.status(401).json({
                    erro: "Token de autenticação inválida",
                    status: "INVALID_TOKEN",
                });

            if (!user.admin) {
                return res.status(401).json({
                    erro: "Token de autenticação inválida",
                    status: "INVALID_TOKEN",
                });
            }

            req.userdata = user;
            next();
        } catch (error) {
            return res.status(400).json({
                erro: "Token de autenticação inválida",
                status: "INVALID_TOKEN",
            });
        }
    }
}