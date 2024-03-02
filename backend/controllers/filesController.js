import { existsSync, readFileSync, createReadStream, exists } from "node:fs";
import { PassThrough } from "node:stream";
import path from "node:path";

import ffmpeg from "fluent-ffmpeg";
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

export const downloadFile = async (req, res) => {
    const { chatId, fileId } = req.params;
    const { optimize, blur } = req.query;
    const MAX_SIZE = 512;
    let imageWidth, imageHeight, checkForFile;

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
    let endPath = path.extname(fileLocation).toLowerCase();
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

    //check image
    const check = isImage(fileLocation);

    res.setHeader("Content-Type", "text/plain");

    if (check) {
        try {
            res.setHeader("Content-Type", check.file_type);
            let data = readFileSync(fileLocation);

            if (check.file_type !== "image/gif") {
                await sharp(data)
                    .metadata()
                    .then((metadata) => {
                        (imageHeight = metadata.height),
                            (imageWidth = metadata.width);

                        if (imageWidth > 1024 || imageHeight > 1024) {
                            const aspectRatio = imageWidth / imageHeight;
                            if (imageWidth > imageHeight) {
                                imageWidth = MAX_SIZE;
                                imageHeight = Math.round(
                                    MAX_SIZE / aspectRatio
                                );
                            } else {
                                imageHeight = MAX_SIZE;
                                imageWidth = Math.round(MAX_SIZE * aspectRatio);
                            }
                        }
                    });

                if (optimize) {
                    const optimizedFilePath = `.thumbnails/${checkForFile.path}${checkForFile.fileName}-optimized.png`;
                    if (!existsSync(optimizedFilePath)) {
                        data = await sharp(data)
                            .png({ quality: 50 })
                            .resize(imageWidth, imageHeight)
                            .toBuffer();

                        //http://localhost:3000/download/gxspgf5zhutxc3z8saog5/65e36c4bd5ab3d394e5a70f4?optimize=true
                        const dir = await checkDir(
                            ".thumbnails/" + checkForFile.path
                        );
                        if (dir) {
                            await sharp(data).toFile(optimizedFilePath);
                        }
                    } else {
                        data = readFileSync(optimizedFilePath);
                    }
                    res.setHeader("Content-Type", "image/png");
                }

                if (blur && !optimize) {
                    const blurredFilePath = `.thumbnails/${checkForFile.path}${checkForFile.fileName}-blur.webp`;
                    if (!existsSync(blurredFilePath)) {
                        data = await sharp(data)
                            .webp({ quality: 10 })
                            .blur(10)
                            .resize(imageWidth, imageHeight)
                            .toBuffer();
                        const dir = await checkDir(
                            ".thumbnails/" + checkForFile.path
                        );
                        if (dir) {
                            await sharp(data).toFile(blurredFilePath);
                        }
                    } else {
                        data = readFileSync(blurredFilePath);
                    }
                    res.setHeader("Content-Type", "image/webp");
                }
            }

            res.setHeader("Content-Length", data.length);
            res.setHeader(
                "Content-Disposition",
                `filename="${checkForFile.fileName}"`
            );

            return res.send(data);
        } catch (error) {
            return res.status(200).download(fileLocation);
        }
    } else if (contentType) {
        if (blur) {
            let data;
            res.setHeader("Content-Type", "image/png");

            const thumbDir = `.thumbnails/${checkForFile.path}`;
            const thumbFullPath = `${thumbDir}${checkForFile.fileName}.png`;
            const dir = await checkDir(`.thumbnails/${checkForFile.path}`);

            if (dir) {
                if (existsSync(thumbFullPath)) {
                    data = readFileSync(thumbFullPath);
                    res.setHeader("Content-Length", data.length);
                    res.setHeader(
                        "Content-Disposition",
                        `filename="${checkForFile.fileName}.png"`
                    );

                    return res.send(data);
                }

                if (ffmpegDetect) {
                    ffmpeg(fileLocation)
                        .screenshots({
                            count: 1,
                            folder: thumbDir,
                            filename: `${checkForFile.fileName}.png`,
                            size: "320x240",
                        })
                        .on("end", () => {
                            try {
                                data = readFileSync(thumbFullPath);
                                res.setHeader("Content-Length", data.length);
                                res.setHeader(
                                    "Content-Disposition",
                                    `filename="${checkForFile.fileName}.png"`
                                );

                                return res.send(data);
                            } catch (error) {
                                return res.status(200);
                            }
                        });
                }
            }
        } else {
            res.setHeader("Content-Type", contentType);
            res.setHeader(
                "Content-Disposition",
                `inline; filename=${checkForFile.fileName}`
            );

            if (contentType == "video/x-matroska" && ffmpegDetect) {
                const filename = `${
                    checkForFile.fileName
                }-${new Date().getTime()}-converted.mp4`;

                res.setHeader("Content-Type", "video/mp4");

                res.setHeader(
                    "Content-Disposition",
                    `inline; filename=${filename}`
                );

                const dir = await checkDir(".converted/");
                if (dir) {
                    let streaming = false;
                    const stream = new PassThrough({ emitClose: true });

                    if (
                        convertedFiles[fileLocation] &&
                        existsSync(convertedFiles[fileLocation])
                    ) {
                        const fileStream = createReadStream(
                            convertedFiles[fileLocation],
                            { emitClose: true }
                        );
                        fileStream.pipe(stream);
                        fileStream.on("close", function () {
                            if (!fileStream.destroyed) fileStream.destroy();
                        });
                        streaming = true;
                    }

                    const convertedFilePath = path.join(
                        ".converted",
                        `${filename}.mp4`
                    );

                    if (!streaming) {
                        ffmpeg(fileLocation)
                            .toFormat("mp4")
                            .videoCodec("copy")
                            .audioCodec("aac")
                            .save(convertedFilePath)
                            .on("end", () => {
                                convertedFiles[fileLocation] =
                                    convertedFilePath;
                                const fileStream = createReadStream(
                                    convertedFilePath,
                                    { emitClose: true }
                                );

                                fileStream.pipe(stream);

                                fileStream.on("close", function () {
                                    if (!fileStream.destroyed)
                                        fileStream.destroy();
                                });
                            })
                            .on("error", (error) => {
                                console.log(error);
                            });
                    }

                    stream.pipe(res);

                    stream.on("close", function () {
                        if (!stream.destroyed) stream.destroy();
                    });

                    return res;
                }
            }
            // caso que seja mp4/webm
            const stream = createReadStream(fileLocation, { emitClose: true });
            stream.pipe(res);

            stream.on("close", function () {
                if (!stream.destroyed) stream.destroy();
            });
            return res;
        }
    }

    return res.status(200).download(fileLocation);
};
