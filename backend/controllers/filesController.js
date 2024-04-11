import { existsSync, readFileSync, createReadStream } from "node:fs";
import { PassThrough } from "node:stream";
import path from "node:path";

import File from "../schema/uploads/File.js";
import { isImage } from "../util/checkImage.js";
import sharp from "sharp";
import { checkDir } from "../util/dirHelper.js";
import { ffmpegDetect } from "../index.js";

const onlyAllowed = /^[a-z0-9]+$/;

const convertedFiles = {};

export const getGroupProfile = async (req, res) => {
    let data;
    const chatId = req.params.chatId;
    const filename = req.params.filename;
    try {
        if (!chatId.match(onlyAllowed)) {
            return res.status(404).json({ erro: "Não encontrado" });
        }
        if (!filename.match(onlyAllowed)) {
            return res.status(404).json({ erro: "Não encontrado" });
        }
        data = readFileSync(".groupimages/" + chatId + "/" + filename, {
            encoding: "utf-8",
        });
    } catch (error) {
        data = readFileSync(".groupimages/default.img", {
            encoding: "utf-8",
        });
    }

    if (req.query.base64) {
        return res.status(200).json({ base64img: data });
    }

    data = Buffer.from(data, "base64");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", data.length);
    return res.send(data);
};

export const getAvatar = async (req, res) => {
    let data;
    const userid = req.params.userId;
    const filename = req.params.filename;

    try {
        if (!userid.match(onlyAllowed)) {
            return res.status(404).json({ erro: "Não encontrado" });
        }

        if (!filename.match(onlyAllowed)) {
            return res.status(404).json({ erro: "Não encontrado" });
        }

        data = readFileSync(".avatars/" + userid + "/" + filename, {
            encoding: "utf-8",
        });
    } catch (error) {
        data = readFileSync(".avatars/default.img", {
            encoding: "utf-8",
        });
    }

    if (req.query.base64) {
        return res.status(200).json({ base64img: data });
    }

    data = Buffer.from(data, "base64");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", data.length);
    return res.send(data);
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns me
 */
export const downloadFile = async (req, res) => {
    if (!chatId || !fileId) {
        return res.status(400).json({ erro: "Algo em falta." });
    }

    if (!fileId.match(onlyAllowed) || !chatId.match(onlyAllowed)) {
        return res.status(404).json({
            erro: "not_found",
            message: "Não encontrei este ficheiro",
        });
    }

    try {
        checkForFile = await File.findOne({
            _id: fileId,
            chat_id: chatId,
        });
    } catch (error) {
        return res.status(404).json({
            erro: "not_found",
            message: "Não encontrei este ficheiro",
        });
    }

    if (!checkForFile) {
        return res.status(404).json({
            erro: "not_found",
            message: "Não encontrei este ficheiro",
        });
    }

    const fileLocation = `.uploads/${checkForFile.path}${checkForFile.fileName}`;

    if (!existsSync(fileLocation)) {
        return res.status(404).json({
            erro: "not_found",
            message: "Não encontrei este ficheiro",
        });
    }

    //check image
    const check = isImage(fileLocation);

    res.setHeader("Content-Type", "text/plain");

    /// make stuff for thumbnail obtain etc..

    return res.status(200).sendFile(fileLocation);
};
