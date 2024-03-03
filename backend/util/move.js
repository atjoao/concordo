import File from "../schema/uploads/File.js";

import { checkDir } from "./dirHelper.js";
import { customAlphabet } from "nanoid/async";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

// todo if an image file or video upload, create optmized/blurred/thumbnail version
export const move = async (user, file, chat_id, verificarChat) => {
    try {
        const userId = user._id;

        const files_ID = [];
        const filesIndentifer = [];
        let fileSize = 0;

        if (!Array.isArray(file)) {
            file = [file];
        }

        for (const ficheiro of file) {
            fileSize = fileSize + ficheiro.size;
            if (fileSize > Number(10 * 1000 ** 2)) {
                throw new Error("BIG_FILE");
            }

            const fileName = ficheiro.name.replace(/ /g, "_") || "ficheiro";
            const filePath =
                verificarChat.chat_id + "/" + (await nanoid()) + "/";

            await checkDir(".uploads/" + filePath).catch((err) => {
                if (err instanceof Error) {
                    throw new Error("CREATE_DIR_ERROR");
                }
            });

            ficheiro.mv(".uploads/" + filePath + "/" + fileName);

            filesIndentifer.push({
                fileName: fileName,
                filePath: filePath,
                chat_id: chat_id,
                userId: userId,
            });
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

        return await Promise.all(files_ID);
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};
