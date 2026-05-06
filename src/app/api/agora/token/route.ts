import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actualUid = body?.uid || Math.floor(Math.random() * 999999) + 1;
    const token = "007eJxTYMhWCNhjNvfBzVufal4JXS5fqbdCcLn+9X4ThokOHyU/nV2twJCclmxuaJxsaWKclmxiYmloYZhmlJRilGRpZmmZmGhkXsz2O7MhkJGhaDELEyMDBIL47AxlmUmpCvnFDAwAGXYhUg==";
    return NextResponse.json({ token, uid: actualUid, channel: "testchannel" });
  } catch (e) {
    const actualUid = Math.floor(Math.random() * 999999) + 1;
    const token = "007eJxTYMhWCNhjNvfBzVufal4JXS5fqbdCcLn+9X4ThokOHyU/nV2twJCclmxuaJxsaWKclmxiYmloYZhmlJRilGRpZmmZmGhkXsz2O7MhkJGhaDELEyMDBIL47AxlmUmpCvnFDAwAGXYhUg==";
    return NextResponse.json({ token, uid: actualUid, channel: "testchannel" });
  }
}