import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const fileExists = (filename: string): boolean =>
    fs.existsSync(path.join(UPLOADS_DIR, filename));

export const deleteFile = (filename: string): void => {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
