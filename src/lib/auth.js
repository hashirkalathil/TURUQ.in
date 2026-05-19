// lib/auth.js
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Ensure this environment variable exists!
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'session_token';

// NEW: Function to create the token using jose
export async function signToken(payload) {
    const alg = 'HS256';
    return new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('1h') // Token expires in 1 hour
        .sign(secret);
}

export async function setSession(token) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const { payload } = await jose.jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME); 
}