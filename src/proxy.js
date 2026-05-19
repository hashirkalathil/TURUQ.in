// src/middleware.js
import { NextResponse } from 'next/server';
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // 1. define paths
  const isAdminPath = pathname.startsWith('/admin');
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

  // 2. Get token
  const sessionToken = request.cookies.get('session_token')?.value;

  // 3. Verify Token Logic
  let isValidSession = false;
  if (sessionToken) {
    try {
      await jose.jwtVerify(sessionToken, secret);
      isValidSession = true;
    } catch (error) {
      console.log('Token invalid or expired');
    }
  }

  // SCENARIO 1: User tries to access Admin but is NOT logged in
  if (isAdminPath && !isAuthPage && !isValidSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // SCENARIO 2: User tries to access Login but IS already logged in
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};