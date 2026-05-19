// src/app/api/auth/me/route.js

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const currentUser = await getSession();
        
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Return the user data (which is stored in the JWT payload)
        return NextResponse.json(currentUser);
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}