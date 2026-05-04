import { Request, Response } from "express";
import { login, getMe } from "../services/authService";

export const loginController = async (
        request: Request,
        response: Response
    ): Promise<void> => {
    const { email, password } = request.body;

    if (!email || !password) {
        response.status(400).json({ error: "Email e senha são obrigatórios." });
        return;
    }

    try {
        const result = await login({ email, password });
        response.json(result);
    } catch (error: any) {
        response.status(401).json({ error: error.message });
    }
};

export const meController = async (
        request: Request,
        response: Response
    ): Promise<void> => {
    try {
        const user = await getMe(request.user!.sub);
        response.json(user);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};