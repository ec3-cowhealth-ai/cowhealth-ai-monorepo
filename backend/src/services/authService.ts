import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { LoginInput, AuthPayload } from "../types/auth";

const getUserPermissions = async (userId: number): Promise<string[]> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            roles: {
                select: {
                    role: {
                        select: {
                            permissions: {
                                select: { permission: { select: { name: true } } },
                            },
                        },
                    },
                },
            },
        },
    });
    
    const permissionSet = new Set<string>();
    for (const userRole of user?.roles ?? []) {
        for (const rolePermission of userRole.role.permissions) {
            permissionSet.add(rolePermission.permission.name);
        }
    }
    
    return Array.from(permissionSet);
};

const signToken = (payload: AuthPayload): string => jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as `${number}${"s" | "m" | "h" | "d"}` | number,
});

export const login = async ({ email, password }: LoginInput) => {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.active) throw new Error("Credenciais inválidas.");
    
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) throw new Error("Credenciais inválidas.");
    
    const permissions = await getUserPermissions(user.id);
    
    const payload: AuthPayload = {
        sub:         user.id,
        email:       user.email,
        profile:     user.profile,
        permissions,
    };
    
    return { token: signToken(payload) };
};

// user → user_roles → role → role_permissions → permission
export const userHasPermission = async (
    userId: number,
    permissionName: string
): Promise<boolean> => {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permissionName);
};

export const getMe = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
        id:        true,
        name:      true,
        email:     true,
        profile:   true,
        active:    true,
        createdAt: true,
        roles: {
            select: {
            role: {
                select: {
                id:   true,
                name: true,
                permissions: {
                    select: {
                    permission: { select: { id: true, name: true } },
                    },
                },
                },
            },
            },
        },
        },
    });

    if (!user) throw new Error("Usuario não encontrado.");

    const permissionSet = new Map<number, string>();
    for (const userRole of user.roles) {
        for (const rolePermission of userRole.role.permissions) {
        const { id, name } = rolePermission.permission;
        permissionSet.set(id, name);
        }
    }

    return {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        profile:     user.profile,
        active:      user.active,
        createdAt:   user.createdAt,
        roles:       user.roles.map((userRole) => ({ id: userRole.role.id, name: userRole.role.name })),
        permissions: Array.from(permissionSet.entries()).map(([id, name]) => ({ id, name })),
    };
};