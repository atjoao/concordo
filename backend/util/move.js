import { ffmpegDetect } from "../index.js";
import File from "../schema/uploads/File.js";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";

import fs from "node:fs/promises";

import { checkDir } from "./dirHelper.js";
import { customAlphabet } from "nanoid/async";
import sharp from "sharp";
import { isImage } from "./checkImage.js";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

async function processVideo(filePath, fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(".uploadsTemp/" + filePath + "/" + fileName)
            .audioCodec("aac")
            .videoCodec("libx264")
            .outputOptions(["-crf 28", "-preset faster"])
            .on("error", function (err, stdout, stderr) {
                console.log(
                    "[Video - Encode] Não consegui processar: %s %s %s",
                    err.message,
                    stdout,
                    stderr
                );
                reject(err);
            })
            .on("end", async function () {
                console.log("[VIDEO] Processado %s - sucesso", fileName);
                //await fs.unlink(".uploadsTemp/" + filePath + "/" + fileName);
                resolve(true);
            })
            .outputFormat("mp4")
            .save(".uploads/" + filePath + "/" + fileName);
    });
}

export const move = async (user, file, chat_id, verificarChat) => {
    const userId = user._id;

    let imageHeight = null,
        imageWidth = null;

    const MAX_SIZE = 512;

    const filesIndentifer = [];
    const files_ID = [];

    if (!Array.isArray(file)) {
        file = [file];
    }

    return new Promise(async (resolve, reject) => {
        try {
            for (const ficheiro of file) {
                const fileName = ficheiro.name.replace(/ /g, "_") || "ficheiro";
                const filePath =
                    verificarChat.chat_id + "/" + (await nanoid()) + "/";

                await checkDir(".uploadsTemp/" + filePath).catch((err) => {
                    if (err instanceof Error) {
                        throw new Error("CREATE_DIR_ERROR");
                    }
                });

                await checkDir(".uploads/" + filePath).catch((err) => {
                    if (err instanceof Error) {
                        throw new Error("CREATE_DIR_ERROR");
                    }
                });

                await new Promise((resolve, reject) => {
                    ficheiro.mv(
                        ".uploadsTemp/" + filePath + "/" + fileName,
                        (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });

                const check = isImage(
                    ".uploadsTemp/" + filePath + "/" + fileName
                );
                let endPath = path.extname(fileName).toLowerCase();
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

                if (check && check.file_type !== "image/gif") {
                    await sharp(".uploadsTemp/" + filePath + "/" + fileName)
                        .metadata()
                        .then((metadata) => {
                            imageHeight = metadata.height;
                            imageWidth = metadata.width;

                            if (imageWidth > 1024 || imageHeight > 1024) {
                                const aspectRatio = imageWidth / imageHeight;
                                if (imageWidth > imageHeight) {
                                    imageWidth = MAX_SIZE;
                                    imageHeight = Math.round(
                                        MAX_SIZE / aspectRatio
                                    );
                                } else {
                                    imageHeight = MAX_SIZE;
                                    imageWidth = Math.round(
                                        MAX_SIZE * aspectRatio
                                    );
                                }
                            }
                        })
                        .catch((err) => reject(err));

                    await checkDir(".thumbnails/" + filePath).catch((err) => {
                        if (err instanceof Error) {
                            throw new Error("CREATE_DIR_ERROR");
                        }
                    });

                    // create optimize ver
                    const optimizedFilePath = `.thumbnails/${filePath}/${fileName}-optimized.png`;
                    await sharp(".uploadsTemp/" + filePath + "/" + fileName)
                        .png({ quality: 50 })
                        .resize(imageWidth, imageHeight)
                        .toFile(optimizedFilePath)
                        .catch((err) => reject(err));

                    const blurredFilePath = `.thumbnails/${filePath}/${fileName}-blur.webp`;
                    await sharp(".uploadsTemp/" + filePath + "/" + fileName)
                        .webp({ quality: 10 })
                        .blur(10)
                        .resize(imageWidth, imageHeight)
                        .toFile(blurredFilePath)
                        .catch((err) => reject(err));

                    // save original file
                    await new Promise((resolve, reject) => {
                        ficheiro.mv(
                            ".uploads/" + filePath + "/" + fileName,
                            async (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    });

                    filesIndentifer.push({
                        fileName: fileName,
                        filePath: filePath,
                        chat_id: chat_id,
                        userId: userId,
                    });
                } else if (contentType && ffmpegDetect) {
                    const thumbDir = `.thumbnails/${filePath}`;
                    const dir = await checkDir(thumbDir).catch((err) => {
                        if (err instanceof Error) {
                            throw new Error("CREATE_DIR_ERROR");
                        }
                    });

                    if (dir) {
                        // create video thumbnail
                        ffmpeg(".uploadsTemp/" + filePath + "/" + fileName)
                            .on("error", function (err, stdout, stderr) {
                                console.log(
                                    "[Thumbnail] Não consegui processar: " +
                                        err.message
                                );
                            })
                            .on("end", () => {
                                console.log(
                                    "[Thumbnail] Thumbnail criada para video,",
                                    fileName
                                );
                            })
                            .screenshots({
                                count: 1,
                                size: "10%",
                                aspect: "16:9",
                                folder: thumbDir,
                                filename: `${fileName}.png`,
                            });
                    }

                    try {
                        const vid = await processVideo(filePath, fileName);
                        if (vid) {
                            filesIndentifer.push({
                                fileName: fileName,
                                filePath: filePath,
                                chat_id: chat_id,
                                userId: userId,
                            });
                        }
                    } catch (error) {
                        throw new Error(error);
                    }
                } else {
                    await new Promise((resolve, reject) => {
                        ficheiro.mv(
                            ".uploads/" + filePath + "/" + fileName,
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    filesIndentifer.push({
                                        fileName: fileName,
                                        filePath: filePath,
                                        chat_id: chat_id,
                                        userId: userId,
                                    });
                                    resolve();
                                }
                            }
                        );
                    });
                }

                await fs.unlink(".uploadsTemp/" + filePath + "/" + fileName);
            }

            for (const file of filesIndentifer) {
                const filesIndentifer = await File.create({
                    fileName: file.fileName,
                    path: file.filePath,
                    chat_id: file.chat_id,
                    uploadedBy: file.userId,
                });

                files_ID.push({
                    file_id: filesIndentifer._id,
                    file_name: file.fileName,
                });
            }

            resolve(files_ID);
        } catch (error) {
            console.log(error);
            reject(error.message);
        }
    });
};
