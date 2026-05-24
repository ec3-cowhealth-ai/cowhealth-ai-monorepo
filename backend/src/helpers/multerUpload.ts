import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, path.resolve(process.cwd(), "uploads"));
    },
    filename: (_request, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension    = path.extname(file.originalname);
        callback(null, `cow-${uniqueSuffix}${extension}`);
    },
});

const fileFilter = (_request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP."));
    }
};

export const cowUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
