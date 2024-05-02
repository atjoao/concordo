import { existsSync, readFileSync, createReadStream } from "node:fs";
import path from "node:path";

import File from "../schema/uploads/File.js";
import mongoose from "mongoose";

const onlyAllowed = /^[a-z0-9]+$/;

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
    try {
        let checkForFile;
        const { optimize, blur, download } = req.query;
        const { chatId, fileId } = req.params;

        if (!mongoose.isValidObjectId(fileId))
            return res.status(404).json({
                erro: "not_found",
                message: "Não encontrei este ficheiro",
            });

        if (!chatId || !fileId) {
            return res.status(400).json({ erro: "Algo em falta." });
        }

        if (!fileId.match(onlyAllowed) || !chatId.match(onlyAllowed)) {
            return res.status(404).json({
                erro: "not_found",
                message: "Não encontrei este ficheiro",
            });
        }

        checkForFile = await File.findOne({
            _id: fileId,
            chat_id: chatId,
        });

        if (!checkForFile) {
            return res.status(404).json({
                erro: "not_found",
                message: "Não encontrei este ficheiro",
            });
        }

        let fileLocation = `.uploads/${checkForFile.path}${checkForFile.fileName}`;
        fileLocation = path.resolve(fileLocation);

        let endPath = path.extname(checkForFile.fileName).toLowerCase();
        let contentType;
        switch (endPath) {
            case ".mp4":
                contentType = "video/mp4";
                break;
            case ".webm":
                contentType = "video/webm";
                break;
            case ".mkv":
                contentType = "video/x-matroska";
                break;
        }

        if (!existsSync(fileLocation)) {
            return res.status(404).json({
                erro: "not_found",
                message: "Não encontrei este ficheiro",
            });
        }

        if (!contentType) {
            if (optimize) {
                const optimizedFilePath = `.thumbnails/${checkForFile.path}${checkForFile.fileName}-optimized.png`;
                if (existsSync(optimizedFilePath)) {
                    fileLocation = path.resolve(optimizedFilePath);
                }
            }

            if (blur && !optimize) {
                const blurredFilePath = `.thumbnails/${checkForFile.path}${checkForFile.fileName}-blur.webp`;
                if (existsSync(blurredFilePath)) {
                    fileLocation = path.resolve(blurredFilePath);
                }
            }
        } else {
            if (optimize || blur) {
                const thumb = `.thumbnails/${checkForFile.path}${checkForFile.fileName}.png`;
                if (existsSync(thumb)) {
                    fileLocation = path.resolve(thumb);
                }
            }
        }
        if (!download) {
            return res.status(200).sendFile(fileLocation);
        } else {
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${checkForFile.fileName}`
            );
            return res.status(200).sendFile(fileLocation);
        }
    } catch (error) {
        console.log(error);
    }
};
