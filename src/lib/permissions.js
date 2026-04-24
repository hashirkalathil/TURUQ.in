// src/lib/permissions.js
import dbConnect from "@/mongodb";
import Settings from "@/models/Settings";
import { getSession } from "@/lib/auth";

export async function checkPermission(req, permissionKey) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super-admin";

  if (isSuperAdmin) {
    return { isSuperAdmin: true, blocked: null };
  }

  await dbConnect();
  const settings = await Settings.findOne().lean();
  const isDisabled = settings?.permissions?.[permissionKey] === true;

  if (isDisabled) {
    const { NextResponse } = await import("next/server");
    return {
      isSuperAdmin: false,
      blocked: NextResponse.json(
        { message: `This action is currently disabled by administrator.` },
        { status: 403 }
      ),
    };
  }

  return { isSuperAdmin: false, blocked: null };
}

/**
 * Check a super_admin_settings key.
 * Only super-admins can bypass this.
 */
export async function checkSuperAdminSetting(permissionKey) {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super-admin";
  if (isSuperAdmin) return { blocked: null };

  await dbConnect();
  const settings = await Settings.findOne().lean();
  const isDisabled = settings?.super_admin_settings?.[permissionKey] === true;

  if (isDisabled) {
    const { NextResponse } = await import("next/server");
    return {
      blocked: NextResponse.json(
        { message: `This action is currently restricted.` },
        { status: 403 }
      ),
    };
  }
  return { blocked: null };
}
