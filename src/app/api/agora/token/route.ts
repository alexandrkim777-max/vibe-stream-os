import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { channelName, uid, role } = await req.json();
    
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    console.log("AppId:", appId ? "exists" : "MISSING");
    console.log("Certificate:", appCertificate ? "exists" : "MISSING");
    console.log("Channel:", channelName);

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 500 });
    }

    const { RtcTokenBuilder, RtcRole } = await import("agora-token");
    
    const expirationTime = 3600 * 24;
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTime + expirationTime;
    const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    console.log("Token generated:", token ? "success" : "FAILED");
    return NextResponse.json({ token });
  } catch (e: any) {
    console.error("Token error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}