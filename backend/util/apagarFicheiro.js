import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

import File from "../schema/uploads/File.js";

async function workerRemoveDirFiles(folderLoc) {
    try {
        const files = await fs.readdir(folderLoc);

        const unlinkFiles = files.map(async (file) => {
            const filePath = path.join(folderLoc, file);
            await fs.unlink(filePath);
        });
        await Promise.all(unlinkFiles);

        await fs.rm(folderLoc, { recursive: true, force: true });
        return "apagado";
    } catch (error) {
        throw error;
    }
}

export async function apagarFicheiro(docFiles) {
    if (!Array.isArray(docFiles) || !docFiles || docFiles.length == 0) return 1;

    for (const file of docFiles) {
        const checkForFile = await File.findOneAndDelete({
            _id: { $eq: file.file_id },
        });

        if (!checkForFile) {
            return 0;
        }

        const fileLocation = `.uploads/${checkForFile.path}${checkForFile.fileName}`;
        const fileThumbLocation = `.thumbnails/${checkForFile.path}${checkForFile.fileName}.png`;

        if (!existsSync(fileLocation)) {
            return 0;
        }

        try {
            await workerRemoveDirFiles(`.uploads/${checkForFile.path}`);
            await workerRemoveDirFiles(`.thumbnails/${checkForFile.path}`);
        } catch (error) {
            return 0;
        }
    }
    return 1;
}
