import { configDotenv } from "dotenv";
import type { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";
configDotenv();

export interface GraphQLContext {
    currentUser: IUser | null;
}

export interface JWTPayload {
    userId: string
}

export function createToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET was not set");
    
    return jwt.sign(
        { userId } satisfies JWTPayload,
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )
}

export function verifyToken(token: string): JWTPayload {
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error("JWT_SECRET was not set");

    return jwt.verify(token, secret) as JWTPayload;
}

export function requireAuth(context: GraphQLContext): IUser {
    if(!context.currentUser) {
        throw new Error("You must be logged in to do this!");
    }

    return context.currentUser;
}