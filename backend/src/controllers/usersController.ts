import { Request, Response } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
    assignRoleToUser,
    removeRoleFromUser,
} from "../services/usersService";

export const listUsers = async (_request: Request, response: Response): Promise<void> => {
    const users = await getAllUsers();
    response.json(users);
};

export const showUser = async (request: Request, response: Response): Promise<void> => {
    try {
        const user = await getUserById(Number(request.params.id));
        response.json(user);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storeUser = async (request: Request, response: Response): Promise<void> => {
    try {
        const user = await createUser(request.body);
        response.status(201).json(user);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updateUserController = async (request: Request, response: Response): Promise<void> => {
    try {
        const user = await updateUser(Number(request.params.id), request.body);
        response.json(user);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const toggleActive = async (request: Request, response: Response): Promise<void> => {
    try {
        const user = await toggleUserActive(Number(request.params.id));
        response.json(user);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const destroyUser = async (request: Request, response: Response): Promise<void> => {
    try {
        await deleteUser(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const addRoleToUser = async (request: Request, response: Response): Promise<void> => {
    try {
        await assignRoleToUser(Number(request.params.id), Number(request.body.roleId));
        response.status(201).json({ message: "Role atribuída com sucesso." });
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const removeUserRole = async (request: Request, response: Response): Promise<void> => {
    try {
        await removeRoleFromUser(Number(request.params.id), Number(request.params.roleId));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};