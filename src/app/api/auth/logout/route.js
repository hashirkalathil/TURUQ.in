// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const COOKIE_NAME = 'session_token';
  
  // ✅ CORRECT: Await cookies() before using its methods
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({ message: 'Logout successful' });
}