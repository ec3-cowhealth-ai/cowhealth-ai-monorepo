import { Request, Response } from "express";
import { register, login, getMe } from "../services/authService";
import { handleRequest } from "../helpers/controllerHelpers";

export const registerController = async (
    request: Request,
    response: Response
): Promise<void> => {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
        response.status(400).json({ error: "Nome, email e senha sao obrigatorios." });
        return;
    }

    await handleRequest(response, () => register({ name, email, password }), 201, 400);
};

export const loginController = async (
    request: Request,
    response: Response
): Promise<void> => {
    const { email, password } = request.body;

    if (!email || !password) {
        response.status(400).json({ error: "Email e senha sao obrigatorios." });
        return;
    }

    await handleRequest(response, () => login({ email, password }), 200, 401);
};

export const meController = async (
    request: Request,
    response: Response
): Promise<void> => {
    await handleRequest(response, () => getMe(request.user!.sub), 200, 404);
};