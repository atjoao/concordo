import sharp from "sharp";
import { writeFileSync } from "node:fs";

import User from "../schema/user/User.js";

import { checkDir } from "../util/dirHelper.js";
import client from "../util/socketClient.js";
import { customAlphabet } from "nanoid/async";

const DEFAULT_USER = {
    online: false,
    id: 0,
    username: "Utilizador não existe",
    descrim: "0000",
};

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export const enviarPedido = async (req, res) => {
    const user = req.userdata;
    const { username, descrim } = req.body;

    if (!username || !descrim)
        return res.status(400).json({
            status: "error",
            message: "Não tenho informações suficientes",
        });

    if (!user.verified)
        return res
            .status(401)
            .json({ status: "not_verified", message: "Verfique o seu email" });

    const user_to = await User.findOne({
        username: { $eq: username },
        descrim: { $eq: descrim },
    });

    if (!user_to)
        return res
            .status(404)
            .json({ status: "error", message: "Utilizador não existe." });

    if (!user_to.verified)
        return res.status(401).json({
            status: "error",
            message: "Este usuario não tem a conta verificada",
        });

    if (user._id.equals(user_to._id))
        return res.status(400).json({
            status: "error",
            message: "Não podes enviar pedido para ti próprio",
        });

    const friend_requests_list = user.friend_requests;
    const friend_list = user.friends;
    const block_list = user_to.block_list;
    const own_block_list = user.block_list;

    if (
        block_list.includes(user._id.toString()) ||
        own_block_list.includes(user_to._id.toString())
    )
        return res
            .status(404)
            .json({ status: "error", message: "Utilizador não existe." });

    if (friend_list.includes(user_to._id.toString()))
        return res.status(200).json({
            status: "info",
            sentTo: user_to._id,
            message: "Já tens amizade com esta pessoa.",
        });

    if (friend_requests_list.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { friend_sent_request: user._id.toString() } }
        );

        await User.updateOne(
            { _id: user._id },
            { $pull: { friend_requests: user_to._id.toString() } }
        );

        await User.updateOne(
            { _id: user_to._id },
            { $addToSet: { friends: user._id.toString() } }
        );

        await User.updateOne(
            { _id: user._id },
            { $addToSet: { friends: user_to._id.toString() } }
        );

        client.emit("userRequestAccepted", {
            from: user._id,
            to: user_to._id,
        });

        return res.status(200).json({
            status: "accepted",
            sentTo: user_to._id,
            message: `Pedido de amizade de ${user_to.username} aceite`,
        });
    }

    await User.updateOne(
        { _id: user_to._id },
        { $addToSet: { friend_requests: user._id.toString() } }
    );

    await User.updateOne(
        { _id: user._id },
        { $addToSet: { friend_sent_request: user_to._id.toString() } }
    );

    client.emit("userRequestSent", {
        from: user._id,
        to: user_to._id,
    });

    return res.status(200).json({
        status: "sent",
        sentTo: user_to._id,
        message: `Pedido de amizade enviado para ${user_to.username}`,
    });
};

export const aceitarPedido = async (req, res) => {
    const user = req.userdata;
    const { userId } = req.query;

    if (!userId)
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });

    const user_to = await User.findById(userId);

    const friend_requests_list = user.friend_requests;
    const friend_list = user.friends;

    if (friend_list.includes(user_to._id.toString()))
        return res
            .status(200)
            .json({ status: "ALTERADY_FRIENDS", message: "Já são amigos." });

    if (friend_requests_list.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { friend_sent_request: user._id.toString() } }
        );
        await User.updateOne(
            { _id: user._id },
            { $pull: { friend_requests: user_to._id.toString() } }
        );

        await User.updateOne(
            { _id: user_to._id },
            { $addToSet: { friends: user._id.toString() } }
        );
        await User.updateOne(
            { _id: user._id },
            { $addToSet: { friends: user_to._id.toString() } }
        );

        client.emit("userRequestAccepted", {
            from: user._id,
            to: user_to._id,
        });

        return res.status(200).json({
            status: "accepted",
            memberId: user_to._id,
            message: `Pedido de amizade de ${user_to.username} aceite`,
        });
    }
    res.status(404).json({ erro: "Não podes aceitar algo que não existe." });
};

export const recusarPedido = async (req, res) => {
    const user = req.userdata;
    const { userId } = req.query;
    if (!userId) return res.status(404).json({ erro: "GIVE ME INFO" });

    const user_to = await User.findById(userId);

    const friend_requests_list = user.friend_requests;

    if (friend_requests_list.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { friend_sent_request: user._id.toString() } }
        );
        await User.updateOne(
            { _id: user._id },
            { $pull: { friend_requests: user_to._id.toString() } }
        );

        client.emit("userRefuseRequest", {
            from: user._id,
            to: user_to._id,
        });

        return res.status(200).json({
            status: "refused",
            memberId: user_to._id,
            message: `Pedido de amizade de ${user_to.username} recusado`,
        });
    }
    return res
        .status(404)
        .json({ status: "NOT_FOUND", message: "Pedido não encontrado." });
};

export const tirarAmizade = async (req, res) => {
    const { userid } = req.query;
    const user = req.userdata;

    if (!userid)
        return res
            .status(400)
            .json({ status: "MISSING_PARAMS", message: "Algo em falta" });

    const user_to = await User.findById(userid);

    const friend_list = user.friends;

    if (friend_list.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { friends: user._id.toString() } }
        );

        await User.updateOne(
            { _id: user._id },
            { $pull: { friends: user_to._id.toString() } }
        );

        client.emit("userFriendRemoved", {
            sender: user._id,
            receiver: user_to._id,
        });

        return res.status(200).json({
            status: "friend_removed",
            message: `Amizade desfeita com ${user_to.username}`,
        });
    }

    return res.status(404).json({
        status: "NOT_FOUND",
        message: "Não podes desfazer algo que nao foi feito.",
    });
};

export const bloquearPessoa = async (req, res) => {
    const { userid } = req.query;
    const user = req.userdata;

    if (!userid) {
        return res
            .status(400)
            .json({ status: "MISSING_PARAMS", message: "Algo em falta" });
    }

    const user_to = await User.findById(userid);

    const pullFromDb = async (field, value) => {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { [field]: { $in: [user._id.toString()] } } }
        );

        await User.updateOne(
            { _id: user._id },
            { $pull: { [field]: { $in: [user_to._id.toString()] } } }
        );
    };

    const checkUserList = async (field) => {
        if (user[field].includes(user_to._id.toString())) {
            await pullFromDb(field);
        }
    };

    if (user.block_list.includes(user_to._id.toString())) {
        return res.status(200).json({
            status: "ALREADY_BLOCKED",
            message: "Já está bloqueado",
        });
    }
    await checkUserList("friends");
    await checkUserList("friend_requests");
    await checkUserList("friend_sent_request");

    await User.updateOne(
        { _id: user._id },
        { $addToSet: { block_list: user_to._id.toString() } }
    );

    client.emit("userBlockList", {
        type: "add",
        userid: user._id.toString(),
        uid: user_to._id.toString(),
    });

    return res.status(200).json({
        status: "USER_BLOCKED",
        message: `${user_to.username} foi bloqueado.`,
    });
};

export const removerPedido = async (req, res) => {
    const { userId } = req.query;
    const user = req.userdata;

    if (!userId)
        return res
            .status(400)
            .json({ erro: "Não tenho informações suficientes" });

    const user_to = await User.findById(userId);

    const requestList = user.friend_sent_request;

    if (requestList.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user_to._id },
            { $pull: { friend_requests: user._id.toString() } }
        );

        await User.updateOne(
            { _id: user._id },
            { $pull: { friend_sent_request: user_to._id.toString() } }
        );

        client.emit("userRefuseRequest", {
            from: user._id,
            to: user_to._id,
        });

        return res.status(200).json({
            status: "request_removed",
            memberId: user_to._id,
            message: `Pedido para ${user_to.username} removido`,
        });
    }

    return res.status(404).json({
        status: "NOT_FOUND",
        message: "Não podes retirar algo que nao foi feito.",
    });
};

export const desbloquearPessoa = async (req, res) => {
    const { userId } = req.query;
    const user = req.userdata;

    if (!userId)
        return res
            .status(400)
            .json({ erro: "Não tenho informações suficientes" });

    const user_to = await User.findById(userId);

    const blocked_list = user.block_list;

    if (blocked_list.includes(user_to._id.toString())) {
        await User.updateOne(
            { _id: user._id },
            { $pull: { block_list: { $in: [user_to._id.toString()] } } }
        );

        client.emit("userBlockList", {
            type: "remove",
            userid: user._id.toString(),
            uid: user_to._id.toString(),
        });

        return res.status(200).json({
            status: "unblocked",
            message: `${user_to.username} foi desbloqueado.`,
        });
    }

    return res.status(404).json({
        status: "NOT_FOUND",
        message: "Não encontrado.",
    });
};

export const updateProfile = async (req, res) => {
    const user = req.userdata;
    const { username } = req.body;
    const tempName = await nanoid();
    let avatar, searchTemp;

    if (username) {
        if (username.trim().length < 4 || username.trim().lenght > 20) {
            return res.status(400).json({
                message: "O nome tem de estar entre 30 e 4 caracters",
                status: "EXCEED_CHARACTERS",
            });
        }
    }

    if (req.files && req.files.avatar) {
        avatar = req.files.avatar;
        const filesMimeTypeAllowed = ["image/jpeg", "image/png", "image/webp"];
        if (!filesMimeTypeAllowed.includes(avatar.mimetype)) {
            return res.status(400).json({
                status: "WRONG_FORMAT",
                message:
                    "Unicos tipos de ficheiro permitido " +
                    filesMimeTypeAllowed,
            });
        }

        try {
            const buffer = Buffer.from(avatar.data);
            const salvarAvatar = await sharp(buffer)
                .resize({ height: 128, width: 182, fit: "cover" })
                .toFormat("png")
                .toBuffer();

            const base64img = salvarAvatar.toString("base64");
            const dir = await checkDir(`.avatars/${user._id}/`);
            if (!dir) {
                return res.status(500).json({
                    status: "PROCESSING_ERROR",
                    erro: "Servidor teve um erro ao processar",
                });
            }
            writeFileSync(`.avatars/${user._id}/avatar`, base64img);
            writeFileSync(`.avatars/${user._id}/${tempName}`, base64img);

            await User.updateOne(
                { _id: user._id },
                { $set: { avatar: `${user._id}/${tempName}` } }
            );
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .json({ erro: "Isto não é uma imagem", status: "NOT_IMAGE" });
        }
    }

    let generate = true;
    let _randomNumber;

    if (username && username != user.username) {
        const randomNumber = () => {
            const currentTime = new Date();
            const seed = currentTime.getTime();
            const random = Math.floor(Math.random() * 10000);
            let seededRandomNumber = (seed + random) % 10000;

            if (seededRandomNumber < 1000) {
                seededRandomNumber += 1000;
            }

            return String(seededRandomNumber);
        };

        searchTemp = await User.findOne({
            username: username.trim(),
            descrim: user.descrim,
        });

        if (searchTemp) generate = true;

        while (generate == true) {
            const rndNumber = randomNumber();
            const searchTemp = await User.findOne({
                username: username.trim(),
                descrim: rndNumber,
            });

            if (!searchTemp) {
                generate = false;
                _randomNumber = rndNumber;
                break;
            }
        }

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    username: username.trim(),
                    ...(searchTemp ? { descrim: _randomNumber } : {}),
                },
            }
        );
    }
    const data = {
        userId: user._id,
        ...(username ? { username: username } : {}),
        ...(searchTemp ? { descrim: _randomNumber } : {}),
        ...(req.files && req.files.avatar
            ? { avatar: `${user._id}/${tempName}` }
            : {}),
    };

    client.emit("userChangedUsername", data);

    return res.status(200).json({ changed: true });
};

export const userinfo = async (req, res) => {
    const user = req.userdata;
    const userid = req.query.userid;

    try {
        const userinfo = userid
            ? await User.findById(userid).exec()
            : await User.findById(user._id).exec();

        if (!userid || userid == user._id.toString()) {
            return res.status(200).json({
                info: {
                    username: userinfo.username,
                    email: userinfo.email,
                    id: userinfo._id,
                    descrim: userinfo.descrim,
                    block_list: userinfo.block_list,
                    chats: userinfo.chats,
                    avatar: userinfo.avatar,
                    last_read_messages: userinfo.last_read_messages,
                    friends: {
                        user: userinfo.friends,
                        requests: userinfo.friend_requests,
                        sent_requests: userinfo.friend_sent_request,
                    },
                },
            });
        }

        if (!userinfo.friends.includes(user._id)) {
            return res.status(200).json({
                info: {
                    id: userinfo._id,
                    username: userinfo.username,
                    descrim: userinfo.descrim,
                    online: 0,
                    avatar: userinfo.avatar,
                },
            });
        }

        return res.status(200).json({
            info: {
                id: userinfo._id,
                username: userinfo.username,
                descrim: userinfo.descrim,
                online: userinfo.online ? 1 : 0,
                avatar: userinfo.avatar,
            },
        });
    } catch {
        return res.status(200).json({ info: DEFAULT_USER });
    }
};
