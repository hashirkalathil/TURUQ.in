import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    const data = {
      _id: new mongoose.Types.ObjectId("68db71987473a8ae700ca7dd"),
      name: "Hashir Kalathil",
      username: "hashirlap123",
      email: "hashirlap123@gmail.com",
      password: "$2b$10$Mp6ge8SlA/kTv6TTmVNozuGqxD3/r/mBskpG0cHS0nXwc51kxX1e2",
      role: "super-admin",
      status: "active",
      login_count: 1,
      avatar: "",
      phone: "09645444607",
      bio: "",
      created_at: new Date("2025-09-30T05:58:48.866Z"),
      updated_at: new Date("2025-09-30T05:58:48.866Z"),
      last_login: new Date("2025-11-27T03:25:31.406Z"),
      __v: 0
    };

    const result = await User.create(data);

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
