import { Buffer } from "node:buffer";
import { readSync, openSync } from "node:fs";

const jpeg = [0xff, 0xd8, 0xff];
const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const gif = [0x47, 0x49, 0x46, 0x38];
const webp = [0x52, 0x49, 0x46, 0x46];

function compareHeader(buffer, header) {
    let type;
    for (let i = 0; i < header.length; i++) {
        if (buffer[i] !== header[i]) {
            return false;
        }
    }

    if (header == jpeg) {
        type = "image/jpeg";
    }

    if (header == png) {
        type = "image/png";
    }

    if (header == gif) {
        type = "image/gif";
    }

    if (header == webp) {
        type = "image/webp";
    }

    return {
        file_type: type,
    };
}

export function isImage(filepath) {
    const buf = Buffer.alloc(8);

    try {
        readSync(openSync(filepath, "r"), buf, 0, 8, 0);

        const compare =
            compareHeader(buf, jpeg) ||
            compareHeader(buf, png) ||
            compareHeader(buf, gif) ||
            compareHeader(buf, webp);

        if (compare) return compare;

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}
