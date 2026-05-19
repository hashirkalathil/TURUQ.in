// src/app/api/admin/authors/route.js

import Author from '@/models/Author';
import { NextResponse } from 'next/server';
import dbConnect from '@/mongodb';
import { checkPermission } from "@/lib/permissions";

const SECURE_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const checkAuth = (req) => {
    if (!SECURE_API_KEY) {
        console.error("Vercel Error: NEXT_PUBLIC_API_KEY or API_KEY is missing in Environment Variables.");
        return false;
    }

    const apikey = req.headers.get("x-api-key");
    
    if (apikey !== SECURE_API_KEY) {
        console.log("Auth Failed. Header Key:", apikey ? "Received" : "Missing");
        return false;
    }
    return true;
}

export async function GET(req) { 
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in GET /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const authors = await Author.find().sort({ created_at: -1 });
        // Wrap in 'data' property if your frontend expects { data: [...] }
        return NextResponse.json({ data: authors }); 
    } catch (error) {
        console.error("Error fetching authors:", error);
        return NextResponse.json({ message: 'Error fetching authors' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in POST /authors:", e)
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const { blocked: permBlock } = await checkPermission(req, "disable_new_authors");
    if (permBlock) return permBlock;

    try {
        const data = await req.json();
        const newAuthor = new Author(data);
        await newAuthor.save();
        return NextResponse.json(newAuthor, { status: 201 });
    } catch (error) {
        console.error("Author creation error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Author with this name or slug already exists.' }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error creating author: Internal Server Error' }, { status: 500 });
    }

}

export async function PUT(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in PUT /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const { blocked: permBlock } = await checkPermission(req, "disable_edit_author");
    if (permBlock) return permBlock;

    try {
        const { _id, ...updateData } = await req.json();

        if (!_id) {
            return NextResponse.json({ message: 'Author ID is required for update.' }, { status: 400 });
        }

        const updatedAuthor = await Author.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

        if (!updatedAuthor) {
            return NextResponse.json({ message: 'Author not found.' }, { status: 404 });
        }

        return NextResponse.json(updatedAuthor);
    } catch (error) {
        console.error("Author update error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'An author with this name or slug already exists.' }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: `Validation failed: ${error.message}` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating author: Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
    } catch (e) {
        console.error("Database connection failed in DELETE /authors:", e);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    if (!checkAuth(req)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const { blocked: permBlock } = await checkPermission(req, "disable_delete_author");
    if (permBlock) return permBlock;

    try {
        const { id } = await req.json(); // Changed to 'id' to match frontend usually

        if (!id) {
            return NextResponse.json({ message: 'Author ID is required for deletion.' }, { status: 400 });
        }

        const deletedAuthor = await Author.findByIdAndDelete(id); 

        if (!deletedAuthor) {
            return NextResponse.json({ message: 'Author not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Author deleted successfully.' });
    } catch (error) {
        console.error("Author deletion error:", error);
        return NextResponse.json({ message: 'Error deleting author: Internal Server Error' }, { status: 500 });
    }
}
