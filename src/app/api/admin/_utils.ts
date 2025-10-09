import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 500 });
  }
  const provided = req.headers.get("x-admin-token") || req.nextUrl.searchParams.get("adminToken");
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}


