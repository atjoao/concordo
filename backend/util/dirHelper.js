import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

export const checkDir = async (path) => {
    if (existsSync(path)) {
        return true;
    } else {
        try {
            const createDir = await mkdir(path, { recursive: true });
            return true;
        } catch (error) {
            console.log(error);
            throw new Error("CREATE_DIR_ERROR");
        }
    }
};
