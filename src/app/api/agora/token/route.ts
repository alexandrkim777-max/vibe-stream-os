import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const channelName = body?.channelName || "testchannel";
    const role = body?.role || "publisher";
    const actualUid = body?.uid || Math.floor(Math.random() * 999999) + 1;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    const { RtcTokenBuilder, RtcRole } = await import("agora-token");
    const expirationTime = 3600 * 24;
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTime + expirationTime;
    const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const cleanChannel = channelName.replace(/-/g, "").substring(0, 64);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId, appCertificate, cleanChannel,
      actualUid, rtcRole, privilegeExpiredTs, privilegeExpiredTs
    );

    return NextResponse.json({ token, uid: actualUid, channel: cleanChannel });
  } catch (e: any) {
    console.error("Token error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}