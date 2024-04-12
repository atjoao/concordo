import User from "../schema/user/User.js";
import Chat from "../schema/user/Chat.js";
import Info, { checkChatDbExists } from "../schema/chat/Info.js";
import Message from "../schema/chat/Message.js";
import { move } from "../util/move.js";
import { checkDir } from "../util/dirHelper.js";
import { writeFileSync } from "node:fs";

import mongoose, { Types, mongo } from "mongoose";

import { customAlphabet } from "nanoid/async";
import client from "../util/socketClient.js";
import { apagarFicheiro } from "../util/apagarFicheiro.js";
import sharp from "sharp";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export const criarGrupo = async (req, res) => {
    const user = req.userdata;
    const memberIds = req.body.memberIds;

    let membersAdded = [];

    if (!memberIds) {
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Campo membersIds não metido",
        });
    }

    if (!Array.isArray(memberIds)) {
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Campo memberIds não é uma array",
        });
    }

    if (memberIds.length < 2) {
        return res.status(400).json({
            status: "MEMBER_LENGHT_LESS_THAN_TWO",
            message: "Não foi possivel criar o grupo",
        });
    }

    const chatId = await nanoid();

    for (const membro of memberIds) {
        try {
            const userTo = await User.findById(membro);
            if (!userTo) {
                throw new Error("NOT_FOUND");
            }

            if (
                !userTo.friends.includes(user._id) ||
                userTo.block_list.includes(user._id)
            ) {
                throw new Error("NOT_FRIENDS");
            }

            if (!membersAdded.includes(userTo._id)) {
                membersAdded.push(userTo._id);
            }
        } catch (error) {
            membersAdded = [];
            break;
        }
    }

    if (membersAdded.length >= 2) {
        await Info(chatId).create({
            members_id: [user._id],
            chatType: "GP",
            chatOwnerId: user._id,
            chatName: `Grupo de ${user.username}`,
        });

        await User.updateOne(
            { _id: user._id },
            { $addToSet: { chats: chatId, $position: 0 } }
        );

        for (const member of membersAdded) {
            await Info(chatId).findOneAndUpdate(
                {
                    infodoc: true,
                },
                { $addToSet: { members_id: member } }
            );

            await Message(chatId).create({
                user_id: "Sistema",
                content: `<@${user._id}> adicionou <@${member}> ao grupo`,
                type: "join",
            });

            await User.updateOne(
                { _id: member },
                { $addToSet: { chats: chatId, $position: 0 } }
            );
        }
        client.emit("groupCreated", chatId);

        return res.status(200).json({
            message: `Grupo criado!`,
            members: membersAdded,
            chat_id: chatId,
            status: "CHAT_OPEN",
        });
    }

    return res
        .status(400)
        .json({ status: "NOT_CREATED", message: "Grupo não foi criado" });
};

export const criarChat = async (req, res) => {
    const user = req.userdata;

    if (!req.params.memberId) {
        res.status(400).json({
            message: "Algo em falta",
            status: "MISSING_PARAMS",
        });
    }
    const userTo = await User.findById(req.params.memberId);

    if (!userTo)
        return res
            .status(404)
            .json({ message: "Esta pessoa existe?", status: "NOT_FOUND" });

    const chatExists =
        (await Chat.findOne({
            members: [user._id, userTo._id],
        })) ||
        (await Chat.findOne({
            members: [userTo._id, user._id],
        }));

    if (!chatExists) {
        let chat_id = await nanoid();
        await Chat.create({
            chat_id: chat_id,
            members: [user._id, userTo._id],
        });

        await User.updateOne(
            { _id: user._id },
            { $addToSet: { chats: chat_id, $position: 0 } }
        );

        await Info(chat_id).create({
            members_id: [user._id, userTo._id],
        });

        return res.status(200).json({
            message: `Chat criado com ${userTo._id}`,
            chat_id: chat_id,
            status: "CHAT_OPEN",
        });
    }

    if (chatExists & !user.chats.includes(chatExists._id)) {
        await User.updateOne(
            { _id: user._id },
            { $addToSet: { chats: chatExists.chat_id } }
        );

        return res.status(200).json({
            message: `Chat aberto com ${userTo._id}`,
            chat_id: chatExists.chat_id,
            status: "CHAT_OPEN",
        });
    }

    await User.updateOne(
        { _id: user._id },
        { $addToSet: { chats: chatExists.chat_id } }
    );

    return res.status(200).json({
        status: "CHAT_FOUND",
        message: "Já existe um chat",
        chat_id: chatExists.chat_id,
    });
};

export const enviarMessagem = async (req, res) => {
    const user = req.userdata;

    if (!req.is("multipart/form-data")) {
        return res.status(400).json({
            erro: `Este pedido tem de ser feito em multipart/form-data`,
        });
    }

    const { content, socketId } = req.body;
    const chatId = req.params.chatId;

    if (!chatId || !socketId) {
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    }

    if (!content && !req.files) {
        return res.status(400).json({
            message: "Messagem sem conteúdo",
            status: "NO_CONTENT",
        });
    }

    if (content && content.trim().length > 1024) {
        return res.status(400).json({
            message: "Passou do limite de caracteres",
            status: "LIMIT_REACHED",
        });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    const checkInfo = await Info(chatId).findOne({
        infodoc: true,
    });

    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    for (const member of checkInfo.members_id) {
        if (
            checkInfo.chatType === "PM" &&
            member.toString() !== user._id.toString()
        ) {
            const memberCheck = await User.findById(member);
            if (
                !memberCheck ||
                !memberCheck.friends.includes(user._id) ||
                memberCheck.block_list.includes(user._id)
            ) {
                return res.status(400).json({
                    status: "NOT_FRIENDS",
                    message: "Não foi possivel enviar a sua mensagem",
                });
            }
        }
    }

    let files_ID = [];

    if (req.files && req.files.files) {
        const file = req.files.files;

        if (file.lenght > 3) {
            return res.status(400).json({
                message: "Existe mais que 3 ficheiros para upload",
                status: "MAX_FILES",
            });
        }

        try {
            files_ID = await move(user, file, chatId, { chat_id: chatId });
        } catch (error) {
            return res.status(500).json({
                message: "Ocorreu um erro no upload de ficheiros",
                status: error.message,
            });
        }
    }

    for (const id of checkInfo.members_id) {
        await User.updateOne({ _id: id }, { $pull: { chats: chatId } });

        await User.updateOne(
            { _id: id },
            { $push: { chats: { $each: [chatId], $position: 0 } } }
        );
    }

    await Message(chatId)
        .create({
            user_id: user._id,
            content: content && content.trim().lenght === 0 ? "" : content,
            filesAnexed: files_ID ? files_ID : [],
        })
        .then((document) => {
            const data = { socketId, chat_id: chatId, ...document._doc };
            client.emit("sendMessage", data);
            return res.status(200).json(data);
        });
};

export const obeterMessagens = async (req, res) => {
    const user = req.userdata;
    let { limite, beforeId } = req.query;
    limite = parseInt(limite) > 50 ? 50 : parseInt(limite);

    if (typeof limite != "number") {
        return res.status(400).json({
            message: "offset tem de ser numbero",
            status: "INVALID_OFFSET",
        });
    }

    const chatId = req.params.chatId;

    if (!chatId) {
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    const checkInfo = await Info(chatId).findOne({
        infodoc: true,
    });

    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    const MESSAGENS_TOTAIS = await Message(chatId).count();

    try {
        const BEFOREID = beforeId
            ? { _id: { $lt: new Types.ObjectId(beforeId) } }
            : {};
        const MESSAGENS = await Message(chatId)
            .find(BEFOREID)
            .limit(50)
            .sort({ createdAt: -1 });
        return res.status(200).json({
            count: MESSAGENS_TOTAIS,
            messagens: MESSAGENS,
        });
    } catch {
        return res.status(404).json({
            message: "Esta messagem não existe",
            status: "NOT_FOUND",
        });
    }
};

export const chatInfo = async (req, res) => {
    const user = req.userdata;
    const chatId = req.params.chatId;
    let friends = null;

    if (!chatId) {
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    const checkInfo = await Info(chatId).findOne({ infodoc: true });
    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    if (checkInfo.chatType && checkInfo.chatType == "PM") {
        for (const member of checkInfo.members_id) {
            if (member.toString() !== user._id.toString()) {
                const memberCheck = await User.findById(member);
                if (
                    !memberCheck ||
                    !memberCheck.friends.includes(user._id) ||
                    memberCheck.block_list.includes(user._id)
                ) {
                    friends = false;
                } else {
                    friends = true;
                }
            }
        }
    }

    return res.status(200).json({
        chatInfo: checkInfo,
        ...(friends !== null ? { friends } : {}),
    });
};

export const apagarMessagem = async (req, res) => {
    const user = req.userdata;
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;

    if (!mongoose.isValidObjectId(messageId)) return;

    if (!chatId || !messageId) {
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    const checkInfo = await Info(chatId).findOne({ infodoc: true });
    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    for (const member of checkInfo.members_id) {
        if (
            checkInfo.chatType === "PM" &&
            member.toString() !== user._id.toString()
        ) {
            const memberCheck = await User.findById(member);
            if (
                !memberCheck ||
                !memberCheck.friends.includes(user._id) ||
                memberCheck.block_list.includes(user._id)
            ) {
                return res.status(400).json({
                    status: "NOT_FRIENDS",
                    message: "Não foi possivel apagar a sua mensagem",
                });
            }
        }
    }
    const messagem = await Message(chatId).findOneAndDelete({
        _id: messageId,
        user_id: user._id,
    });

    if (!messagem) {
        return res.status(404).json({
            message: "Não encontrei esta messagem",
            status: "NOT_FOUND",
        });
    }

    await apagarFicheiro(messagem.filesAnexed);

    client.emit("userDeletedMessage", {
        chatId: chatId,
        messageId: messagem._id,
    });

    return res
        .status(200)
        .json({ message: "Messagem apagada!", status: "DELETED" });
};

export const editarMessagem = async (req, res) => {
    const user = req.userdata;
    const chatId = req.params.chatId;
    const messageId = req.params.messageId;
    const { content } = req.body;

    if (!chatId || !messageId) {
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    const checkInfo = await Info(chatId).findOne({ infodoc: true });
    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }
    for (const member of checkInfo.members_id) {
        if (
            checkInfo.chatType === "PM" &&
            member.toString() !== user._id.toString()
        ) {
            const memberCheck = await User.findById(member);
            if (
                !memberCheck ||
                !memberCheck.friends.includes(user._id) ||
                memberCheck.block_list.includes(user._id)
            ) {
                return res.status(400).json({
                    status: "NOT_FRIENDS",
                    message: "Não foi possivel editar a sua mensagem",
                });
            }
        }
    }

    const messagem = await Message(chatId).findOneAndUpdate(
        {
            _id: messageId,
            user_id: user._id,
        },
        { content: content },
        { new: true }
    );

    if (!messagem) {
        return res.status(404).json({
            message: "Não encontrei esta messagem",
            status: "NOT_FOUND",
        });
    }

    const data = {
        chatId: chatId,
        messageId: messageId,
        message: messagem.content,
        updatedAt: messagem.updatedAt,
    };
    client.emit("userEditMessage", data);

    return res.status(200).json({
        message: "Messagem atualziada!",
        status: "UPDATED",
        message: messagem,
    });
};

export const fecharChat = async (req, res) => {
    const user = req.userdata;
    const chatId = req.params.chatId;

    if (!user.chats.includes(chatId)) {
        return res.status(400).json({
            message: "Este chat não está aberto",
            status: "ALTERADY_CLOSED",
        });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    let checkInfo = await Info(chatId).findOne({ infodoc: true });
    if (checkInfo.chatType && checkInfo.chatType == "GP") {
        checkInfo = await Info(chatId).findOneAndUpdate(
            { infodoc: true },
            {
                $pull: { members_id: user._id },
            },
            { new: true }
        );

        if (checkInfo.chatOwnerId == user._id) {
            const newOwner =
                checkInfo.members_id[
                    Math.floor(Math.random() * checkInfo.members_id.length)
                ];

            await Info(chatId).findOneAndUpdate(
                { infodoc: true },
                {
                    $set: { chatOwnerId: new Types.ObjectId(newOwner) },
                }
            );
        }

        await Message(chatId)
            .create({
                user_id: "Sistema",
                content: `<@${user._id}> saiu do grupo`,
                type: "leave",
            })
            .then(async (document) => {
                const data = {
                    socketId: "sistema",
                    chat_id: chatId,
                    ...document._doc,
                };
                client.emit("sendMessage", data);

                client.emit("groupUserLeft", {
                    chat_id: chatId,
                    memberId: user._id,
                });

                await User.updateOne(
                    { _id: user._id },
                    { $pull: { chats: chatId } }
                );
            });
        return res.status(200).json({ status: true });
    }

    await User.updateOne({ _id: user._id }, { $pull: { chats: chatId } });
    return res.status(200).json({ status: true });
};

export const adicionarAoGrupo = async (req, res) => {
    const user = req.userdata;
    let membersAdded = [];
    const memberIds = req.body.memberIds;
    const chatId = req.params.chatId;

    if (!chatId) {
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Campo chatId não metido.",
        });
    }

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    const checkInfo = await Info(chatId).findOne({
        infodoc: true,
    });

    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    if (!memberIds) {
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Body: membersIds não metido",
        });
    }

    if (!Array.isArray(memberIds)) {
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Body: memberIds não é uma array",
        });
    }

    for (const membro of memberIds) {
        try {
            const userTo = await User.findById(membro);
            if (!userTo) {
                throw new Error("NOT_FOUND");
            }

            if (
                !userTo.friends.includes(user._id) ||
                userTo.block_list.includes(user._id)
            ) {
                throw new Error("NOT_FRIENDS");
            }

            if (checkInfo.members_id.includes(userTo._id)) {
                throw new Error("MEMBER_ALTERADY_ADDED");
            }

            if (!membersAdded.includes(userTo._id)) {
                membersAdded.push(userTo._id);
            }
        } catch (error) {
            membersAdded = [];
            return res.status(400).json({
                status: error,
                message: "Ocorreu algo inexperado.",
            });
        }
    }

    if (membersAdded.length >= 1) {
        let groupDoc = undefined;
        for (const member of membersAdded) {
            groupDoc = await Info(chatId).findOneAndUpdate(
                {
                    infodoc: true,
                },
                { $addToSet: { members_id: member } },
                { new: true }
            );

            await User.updateOne(
                { _id: member },
                { $addToSet: { chats: chatId, $position: 0 } }
            );

            await Message(chatId)
                .create({
                    user_id: "Sistema",
                    content: `<@${user._id}> adicionou <@${member}> ao grupo`,
                    type: "join",
                })
                .then(async (document) => {
                    // supostamnete funciona...
                    const data = {
                        socketId: "sistema",
                        chat_id: chatId,
                        ...document._doc,
                    };
                    client.emit("sendMessage", data);

                    await User.updateOne(
                        { _id: user._id },
                        { $addToSet: { chats: chatId } }
                    );
                });
        }
        client.emit("newUserJoin", {
            chat_id: chatId,
            ...groupDoc._doc,
        });

        return res.status(200).json({ status: true });
    }

    return res.status(400).json({ status: false });
};

export const expulsarGrupo = async (req, res) => {
    const user = req.userdata;

    const chatId = req.params.chatId;
    const memberId = req.params.memberId;

    const member = await User.findById(memberId);
    if (!member) {
        return res.status(404).json({
            status: "NOT_FOUND",
            message: "Utilizador não existe",
        });
    }

    if (!chatId || !memberId)
        return res.status(400).json({
            status: "MISSING_PARAMS",
            message: "Algo em falta",
        });

    const checkDb = checkChatDbExists(chatId);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    const checkInfo = await Info(chatId).findOne({
        infodoc: true,
    });

    if (!checkInfo || !checkInfo.members_id.includes(user._id)) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    if (checkInfo.chatOwnerId != user._id) {
        return res.status(404).json({
            message: "Não és o administrador do grupo",
            status: "NOT_GROUP_ADMIN",
        });
    }

    await Info(chatId)
        .updateOne(
            {
                infodoc: true,
            },
            { $pull: { members_id: member._id } }
        )
        .then(async () => {
            await Message(chatId)
                .create({
                    user_id: "Sistema",
                    content: `<@${member._id.toString()}> foi expulso`,
                    type: "leave",
                })
                .then(async (document) => {
                    client.emit("sendMessage", {
                        socketId: "sistema",
                        chat_id: chatId,
                        ...document._doc,
                    });

                    client.emit("groupUserLeft", {
                        chat_id: chatId,
                        memberId: member._id,
                    });

                    await User.updateOne(
                        { _id: member._id },
                        { $pull: { chats: chatId } }
                    );
                    return res.status(200).json({ status: "USER_REMOVED" });
                });
        })
        .catch(() => {
            return res.status(500).json({ status: "USER_NOT_REMOVED" });
        });
};

export const configGroup = async (req, res) => {
    const user = req.userdata;
    const chat_id = req.params.chatId;
    const tempName = await nanoid();

    let changedName = null;

    /**@type {string} */
    const groupname = req.body.groupname;

    if (groupname) {
        if (groupname.trim().length < 1 || groupname.trim().length > 50) {
            return res.status(400).json({
                message:
                    "O nome tem de grupo têm de estar dentro de 1 a 50 caracters",
                status: "EXCEED_CHARACTERS",
            });
        }
    }

    const checkDb = checkChatDbExists(chat_id);
    if (!checkDb) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    const checkInfo = await Info(chat_id).findOne({
        infodoc: true,
    });
    if (!checkInfo) {
        return res
            .status(404)
            .json({ message: "Este chat não existe", status: "NOT_FOUND" });
    }

    if (String(user._id) !== checkInfo.chatOwnerId) {
        return res.status(400).json({
            message: "Sem permissão para esta alteração",
            status: "NO_PERMS",
        });
    }

    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
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
                .resize({
                    height: 128,
                    height: 128,
                    fit: "cover",
                })
                .toFormat("png")
                .toBuffer();
            const base64img = salvarAvatar.toString("base64");
            const dir = await checkDir(`.groupimages/${chat_id}/`);
            if (!dir) {
                return res.status(500).json({
                    status: "PROCESSING_ERROR",
                    erro: "Servidor teve um erro ao processar",
                });
            }
            writeFileSync(`.groupimages/${chat_id}/default`, base64img);
            writeFileSync(`.groupimages/${chat_id}/${tempName}`, base64img);

            await Info(chat_id).updateOne(
                { infodoc: true },
                { $set: { chatAvatar: `${chat_id}/${tempName}` } }
            );
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                erro: "Isto não é uma imagem",
                status: "NOT_IMAGE",
            });
        }
    }

    if (groupname && groupname != checkInfo.chatName) {
        await Info(chat_id).updateOne(
            { infodoc: true },
            { $set: { chatName: `${groupname}` } }
        );
        changedName = true;
    }

    const data = {
        chat_id,
        ...(changedName ? { chatName: groupname } : {}),
        ...(req.files && req.files.avatar
            ? { chatAvatar: `${chat_id}/${tempName}` }
            : {}),
    };

    if (changedName) {
        await Message(chat_id)
            .create({
                user_id: "Sistema",
                content: `<@${user._id.toString()}> mudou o nome do grupo para ${groupname}`,
                type: "edit",
            })
            .then(async (document) => {
                client.emit("sendMessage", {
                    socketId: "sistema",
                    chat_id: chat_id,
                    ...document._doc,
                });
            });
    }

    client.emit("groupDetailsChanged", data);

    return res.status(200).json({ changed: true });
};
