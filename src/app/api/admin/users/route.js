// src/app/api/admin/users/route.js

import User from "@/models/User";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

const SECURE_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const checkAuth = (req) => {
    const apikey = req.headers.get("x-api-key");
    
    if (!SECURE_API_KEY) {
        console.error("CRITICAL ERROR: No API Key found in Server Environment Variables.");
        return false;
    }

    if (apikey !== SECURE_API_KEY) {
        return false;
    }
    return true;
}

export async function GET(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in GET /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    let result;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      result = user; 
    } else {
      result = await User.find().sort({ created_at: -1 });
    }

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getSession();
    const settings = await Settings.findOne().lean();
    
    const isSuperAdmin = session?.role === "super-admin";
    
    if (!isSuperAdmin && settings?.permissions?.disable_new_users) {
      return NextResponse.json(
        { message: "User creation is currently disabled by administrator." },
        { status: 403 }
      );
    }

    const data = await req.json();

    if (!data.password) {
      return NextResponse.json(
        { message: "Password is required for new user creation." },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);

    const newUser = new User(data);
    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: `Validation failed: ${error.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error creating user: Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in PUT /users:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getSession();
    const settings = await Settings.findOne().lean();
    const isSuperAdmin = session?.role === "super-admin";

    const { _id, password, ...updateData } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { message: "User ID is required for update." },
        { status: 400 }
      );
    }

    // Check if user is trying to edit a super-admin
    const userToEdit = await User.findById(_id);
    if (!userToEdit) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (userToEdit.role === "super-admin") {
      if (!isSuperAdmin && settings?.super_admin_settings?.disable_edit_super_admin) {
        return NextResponse.json(
          { message: "Editing super-admin accounts is protected." },
          { status: 403 }
        );
      }
    } else if (!isSuperAdmin && settings?.permissions?.disable_edit_user) {
      return NextResponse.json(
        { message: "User editing is currently disabled by administrator." },
        { status: 403 }
      );
    }

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    } else {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: `Validation failed: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error updating user: Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in DELETE /users:", e);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getSession();
    const settings = await Settings.findOne().lean();
    const isSuperAdmin = session?.role === "super-admin";

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required for deletion." },
        { status: 400 }
      );
    }

    // Check if user is trying to delete a super-admin
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (userToDelete.role === "super-admin") {
      if (!isSuperAdmin && settings?.super_admin_settings?.disable_edit_super_admin) {
        return NextResponse.json(
          { message: "Deleting super-admin accounts is protected." },
          { status: 403 }
        );
      }
    } else if (!isSuperAdmin && settings?.permissions?.disable_delete_user) {
      return NextResponse.json(
        { message: "User deletion is currently disabled by administrator." },
        { status: 403 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { message: "Error deleting user: Internal Server Error" },
      { status: 500 }
    );
  }
}