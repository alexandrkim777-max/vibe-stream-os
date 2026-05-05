"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Mic, MicOff, Video, VideoOff, Phone,
  Users, Send, Heart, Share2, ArrowLeft, Smile
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function Sparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles: any[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        pulse: Math.random() * Math.PI * 2,
        color: ["167,139,250","99,102,241","236,72,153","14,165,233"][Math.floor(Math.random()*4)],
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.02;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const o = 0.2 + 0.4 * Math.sin(p.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${o})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const getAgoraToken = async (channelName: string, role: "publisher" | "subscriber") => {
  const res = await fetch("/api/agora/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channelName,
      uid: Math.floor(Math.random() * 999999) + 1,
      role
    }),
  });
  const data = await res.json();
  return { token: data.token, uid: data.uid, channel: data.channel };
};

export default function StreamPage() {
  const params = useParams();
  const streamId = params.streamId as string;

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [callRequests, setCallRequests] = useState<any[]>([]);
  const [showCallRequests, setShowCallRequests] = useState(false);
  const [activeCaller, setActiveCaller] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle"|"pending"|"accepted">("idle");
  const [viewerCount, setViewerCount] = useState(0);
  const [userName, setUserName] = useState("Guest_" + Math.floor(Math.random() * 1000));

  const hostClientRef = useRef<any>(null);
  const viCallClientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const viCallTracksRef = useRef<any[]>([]);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const callerVideoRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  // Clean channel name for Agora (remove hyphens, max 64 chars)
  const agoraChannel = streamId.replace(/-/g, "").substring(0, 64);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        setUserName(u.user_metadata?.username || u.email?.split("@")[0] || "Guest");
      }
    });

    fetchMessages();
    fetchCallRequests();
    fetchViewerCount();

    const msgChannel = supabase.channel(`chat-${streamId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public",
        table: "messages", filter: `stream_id=eq.${streamId}`
      }, (payload) => setChatMessages(prev => [...prev, payload.new]))
      .subscribe();

    const callChannel = supabase.channel(`calls-${streamId}`)
      .on("postgres_changes", {
        event: "*", schema: "public",
        table: "call_requests", filter: `stream_id=eq.${streamId}`
      }, () => fetchCallRequests())
      .subscribe();

    const streamChannel = supabase.channel(`stream-viewers-${streamId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public",
        table: "streams", filter: `id=eq.${streamId}`
      }, (payload) => setViewerCount(payload.new.viewer_count || 0))
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(callChannel);
      supabase.removeChannel(streamChannel);
      cleanup();
    };
  }, [streamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const cleanup = async () => {
    localTracksRef.current.forEach(t => { try { t.stop(); t.close(); } catch(e) {} });
    viCallTracksRef.current.forEach(t => { try { t.stop(); t.close(); } catch(e) {} });
    try { await hostClientRef.current?.leave(); } catch(e) {}
    try { await viCallClientRef.current?.leave(); } catch(e) {}
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*")
      .eq("stream_id", streamId).order("created_at", { ascending: true }).limit(50);
    if (data) setChatMessages(data);
  };

  const fetchCallRequests = async () => {
    const { data } = await supabase.from("call_requests").select("*")
      .eq("stream_id", streamId).eq("status", "pending")
      .order("created_at", { ascending: true });
    if (data) setCallRequests(data);
  };

  const fetchViewerCount = async () => {
    const { data } = await supabase.from("streams").select("viewer_count").eq("id", streamId).single();
    if (data) setViewerCount(data.viewer_count || 0);
  };

  const updateViewerCount = async (delta: number) => {
    try {
      await supabase.rpc("increment_viewer_count", { stream_id: streamId, delta });
    } catch(e) { console.error("Viewer count error:", e); }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: userName, content: message
    });
    setMessage("");
  };

  const joinAsHost = async () => {
    setIsLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      hostClientRef.current = client;

      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && callerVideoRef.current) {
          user.videoTrack?.play(callerVideoRef.current);
          setActiveCaller(user.uid?.toString() || "Guest");
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      client.on("user-unpublished", () => setActiveCaller(null));
      client.on("user-left", () => setActiveCaller(null));

      await client.setClientRole("host");
      const { token, uid } = await getAgoraToken(agoraChannel, "publisher");
      await client.join(appId, agoraChannel, token, uid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];
      if (localVideoRef.current) videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);

      setIsJoined(true);
      setIsHost(true);

      await supabase.from("messages").insert({
        stream_id: streamId, user_name: "System", content: "🔴 Stream started!"
      });

    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const joinAsViewer = async () => {
    setIsLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      hostClientRef.current = client;

      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && localVideoRef.current) {
          user.videoTrack?.play(localVideoRef.current);
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      await client.setClientRole("audience", { level: 1 });
      const { token, uid } = await getAgoraToken(agoraChannel, "subscriber");
      await client.join(appId, agoraChannel, token, uid);

      setIsJoined(true);
      await updateViewerCount(1);

      const myName = userName;
      supabase.channel(`myrequest-${streamId}-${myName}`)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public",
          table: "call_requests",
          filter: `stream_id=eq.${streamId}`
        }, async (payload) => {
          if (payload.new.status === "accepted" && payload.new.caller_name === myName) {
            await startViCall();
          }
        })
        .subscribe();

    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const startViCall = async () => {
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const viClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      viCallClientRef.current = viClient;

      await viClient.setClientRole("host");
      const { token, uid } = await getAgoraToken(agoraChannel, "publisher");
      await viClient.join(appId, agoraChannel, token, uid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      viCallTracksRef.current = [audioTrack, videoTrack];
      await viClient.publish([audioTrack, videoTrack]);

      setCallStatus("accepted");

      await supabase.from("messages").insert({
        stream_id: streamId, user_name: "System",
        content: `📹 ${userName} is now live on screen!`
      });

    } catch (e: any) {
      console.error("viCall error:", e.message);
      alert(`viCall error: ${e.message}`);
    }
  };

  const requestCall = async () => {
    setCallStatus("pending");
    await supabase.from("call_requests").insert({
      stream_id: streamId, caller_name: userName, status: "pending"
    });
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System",
      content: `📞 ${userName} wants to join!`
    });
  };

  const acceptCall = async (req: any) => {
    await supabase.from("call_requests").update({ status: "accepted" }).eq("id", req.id);
    setActiveCaller(req.caller_name);
    setShowCallRequests(false);
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System",
      content: `🎉 ${req.caller_name} joined the stream!`
    });
  };

  const rejectCall = async (req: any) => {
    await supabase.from("call_requests").update({ status: "rejected" }).eq("id", req.id);
  };

  const endCall = async () => {
    viCallTracksRef.current.forEach(t => { try { t.stop(); t.close(); } catch(e) {} });
    try { await viCallClientRef.current?.leave(); } catch(e) {}
    viCallTracksRef.current = [];
    setActiveCaller(null);
    setCallStatus("idle");
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System", content: "📞 Call ended"
    });
  };

  const endStream = async () => {
    if (!confirm("End the stream?")) return;
    await cleanup();
    await supabase.from("streams")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", streamId);
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System",
      content: "Stream ended. Thanks for watching! 👋"
    });
    setIsJoined(false);
    setIsHost(false);
  };

  const leaveStream = async () => {
    await cleanup();
    if (!isHost) await updateViewerCount(-1);
    setIsJoined(false);
    setIsHost(false);
    setCallStatus("idle");
  };

  const toggleMic = async () => {
    const tracks = callStatus === "accepted" ? viCallTracksRef.current : localTracksRef.current;
    const t = tracks[0];
    if (t) { await t.setEnabled(!micOn); setMicOn(!micOn); }
  };

  const toggleCam = async () => {
    const tracks = callStatus === "accepted" ? viCallTracksRef.current : localTracksRef.current;
    const t = tracks[1];
    if (t) { await t.setEnabled(!camOn); setCamOn(!camOn); }
  };

  const COLORS = ["text-violet-400","text-emerald-400","text-pink-400","text-amber-400","text-sky-400"];
  const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

  if (!mounted) return null;

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden" style={{background:"#060614"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRing{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:0;transform:scale(1.8)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 40px rgba(124,58,237,0.8)}}
        .msg-in{animation:fadeUp .25s ease}
        .float{animation:float 4s ease-in-out infinite}
        .neon{animation:neonPulse 3s ease-in-out infinite}
        .ctrl-btn{width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:all .2s}
        .ctrl-btn:hover{transform:scale(1.12)}
        .liquid-btn{transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
        .liquid-btn:hover{transform:scale(1.05) translateY(-2px)}
        .scrollbar-none::-webkit-scrollbar{display:none}
        .scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(80px)"}} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#4f46e5,transparent)",filter:"blur(80px)"}} />
        <Sparkles />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-4 md:px-5 py-3"
        style={{borderBottom:"1px solid rgba(124,58,237,0.2)",background:"rgba(6,6,20,0.9)",backdropFilter:"blur(20px)"}}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="ctrl-btn" style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",width:36,height:36,borderRadius:12}}>
            <ArrowLeft size={15} className="text-violet-400" />
          </div>
          <span className="text-white/40 text-sm group-hover:text-white/70 hidden sm:block">Back</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {isJoined && isHost && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)"}}>
              <div className="relative w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute inset-0 rounded-full bg-red-400"
                  style={{animation:"pulseRing 1.5s ease-in-out infinite"}} />
              </div>
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live</span>
            </div>
          )}
          {callStatus === "pending" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.4)"}}>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-bold">Waiting...</span>
            </div>
          )}
          {callStatus === "accepted" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)"}}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">On Air!</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.25)"}}>
            <Users size={11} className="text-violet-400" />
            <span className="text-violet-300 text-xs font-semibold">{viewerCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2 md:px-3 py-1.5 rounded-full text-xs font-semibold hidden sm:block"
            style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"rgba(167,139,250,0.9)"}}>
            {userName}
          </div>
          <button className="ctrl-btn text-white/40 hover:text-violet-400"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",width:36,height:36,borderRadius:12}}>
            <Share2 size={14} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`relative flex-1 min-h-0 ${activeCaller ? "grid grid-cols-2 gap-1.5 p-1.5" : ""}`}
            style={{background:"linear-gradient(135deg,#0d0628,#080818)"}}>

            <div className={`relative overflow-hidden ${activeCaller ? "rounded-2xl" : ""}`}
              style={!activeCaller ? {minHeight:"350px"} : {}}>
              <div ref={localVideoRef} className="absolute inset-0" />

              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="relative w-28 h-28 mx-auto mb-6 float">
                      <div className="absolute -inset-4 rounded-full opacity-30"
                        style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(20px)"}} />
                      <div className="absolute -inset-2 rounded-full opacity-20 animate-ping"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}} />
                      <div className="relative w-full h-full rounded-full flex items-center justify-center text-5xl neon"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                        🎙
                      </div>
                    </div>
                    <p className="text-white/90 font-bold text-lg mb-2">VibeCity Stream</p>
                    <p className="text-white/30 text-sm mb-6">
                      You: <span className="text-violet-400 font-semibold">{userName}</span>
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <button onClick={joinAsHost} disabled={isLoading}
                        className="flex items-center gap-2 text-white font-bold px-5 py-3 rounded-2xl disabled:opacity-40 liquid-btn neon"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                        {isLoading
                          ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          : <><Video size={16} />Go Live</>}
                      </button>
                      <button onClick={joinAsViewer} disabled={isLoading}
                        className="flex items-center gap-2 text-white/70 font-semibold px-5 py-3 rounded-2xl disabled:opacity-40 liquid-btn"
                        style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)"}}>
                        <Users size={16} />Watch
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isJoined && (
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={isHost
                      ? {background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.5)",color:"rgb(252,165,165)"}
                      : {background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",color:"rgb(167,139,250)"}}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isHost ? "bg-red-400 animate-pulse" : "bg-violet-400"}`} />
                    {isHost ? "HOST" : "VIEWER"}
                  </div>
                </div>
              )}
            </div>

            {activeCaller && (
              <div className="relative rounded-2xl overflow-hidden flex items-center justify-center"
                style={{background:"linear-gradient(135deg,#0a2818,#071a14)",border:"1px solid rgba(16,185,129,0.2)"}}>
                <div className="absolute inset-0"
                  style={{background:"radial-gradient(circle at center,rgba(16,185,129,0.1),transparent 70%)"}} />
                <div ref={callerVideoRef} className="absolute inset-0" />
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-2 text-white"
                    style={{background:"linear-gradient(135deg,#059669,#0d9488)"}}>
                    {activeCaller[0]?.toUpperCase() || "G"}
                  </div>
                  <p className="text-white/70 text-sm font-semibold">{activeCaller}</p>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{background:"rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.5)",color:"rgb(52,211,153)"}}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />GUEST
                  </div>
                </div>
                <button onClick={endCall}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{background:"rgba(239,68,68,0.6)"}}>
                  <Phone size={12} className="text-white rotate-[135deg]" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 px-3 py-3 flex-wrap flex-shrink-0"
            style={{background:"rgba(6,6,20,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(124,58,237,0.15)"}}>

            <button onClick={toggleMic} className="ctrl-btn"
              style={{background: micOn ? "rgba(124,58,237,0.12)" : "rgba(239,68,68,0.4)",
                border:`1px solid ${micOn ? "rgba(124,58,237,0.3)" : "rgba(239,68,68,0.5)"}`}}>
              {micOn ? <Mic size={18} className="text-violet-300" /> : <MicOff size={18} className="text-white" />}
            </button>

            <button onClick={toggleCam} className="ctrl-btn"
              style={{background: camOn ? "rgba(124,58,237,0.12)" : "rgba(239,68,68,0.4)",
                border:`1px solid ${camOn ? "rgba(124,58,237,0.3)" : "rgba(239,68,68,0.5)"}`}}>
              {camOn ? <Video size={18} className="text-violet-300" /> : <VideoOff size={18} className="text-white" />}
            </button>

            <button onClick={() => { setLiked(!liked); setLikeCount(p => liked ? p-1 : p+1); }}
              className="ctrl-btn"
              style={{background: liked ? "rgba(236,72,153,0.35)" : "rgba(124,58,237,0.12)",
                border:`1px solid ${liked ? "rgba(236,72,153,0.5)" : "rgba(124,58,237,0.3)"}`}}>
              <Heart size={18} className={liked ? "text-pink-300 fill-pink-300" : "text-violet-300"} />
            </button>

            <span className="text-violet-400/50 text-xs font-semibold">{likeCount.toLocaleString()}</span>

            {isHost ? (
              <button onClick={() => setShowCallRequests(!showCallRequests)}
                className="relative flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-2xl text-sm liquid-btn"
                style={{background:"linear-gradient(135deg,#059669,#0d9488)"}}>
                <Phone size={15} />
                <span className="hidden sm:block">Requests</span>
                {callRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-bounce"
                    style={{background:"#ef4444"}}>
                    {callRequests.length}
                  </span>
                )}
              </button>
            ) : isJoined && callStatus === "idle" ? (
              <button onClick={requestCall}
                className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-2xl text-sm liquid-btn neon"
                style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                <Phone size={15} />
                <span className="hidden sm:block">Call Into Stream</span>
                <span className="sm:hidden">Call</span>
              </button>
            ) : isJoined && callStatus === "pending" ? (
              <div className="flex items-center gap-2 text-yellow-400 font-bold px-4 py-2.5 rounded-2xl text-sm"
                style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)"}}>
                <Phone size={15} className="animate-pulse" />
                <span className="hidden sm:block">Waiting...</span>
              </div>
            ) : isJoined && callStatus === "accepted" ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold px-4 py-2.5 rounded-2xl text-sm"
                style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)"}}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                On Air!
              </div>
            ) : null}

            {isHost && isJoined && (
              <button onClick={endStream}
                className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-2xl text-sm liquid-btn"
                style={{background:"rgba(239,68,68,0.4)",border:"1px solid rgba(239,68,68,0.5)"}}>
                <VideoOff size={15} />
                <span className="hidden sm:block">End Stream</span>
              </button>
            )}

            {isJoined && !isHost && (
              <button onClick={leaveStream} className="ctrl-btn"
                style={{background:"rgba(239,68,68,0.35)",border:"1px solid rgba(239,68,68,0.4)"}}>
                <Phone size={18} className="text-red-300 rotate-[135deg]" />
              </button>
            )}
          </div>
        </div>

        <div className="w-64 md:w-72 flex flex-col scrollbar-none flex-shrink-0"
          style={{background:"rgba(6,6,20,0.9)",backdropFilter:"blur(24px)",borderLeft:"1px solid rgba(124,58,237,0.15)"}}>
          <div className="px-3 md:px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
            <span className="text-white font-bold text-sm">Live Chat</span>
            <div className="px-2 py-0.5 rounded-full text-xs font-semibold hidden sm:block"
              style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"rgba(167,139,250,0.9)"}}>
              {userName}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none px-3 md:px-4 py-3 space-y-2 min-h-0">
            {chatMessages.length === 0 && (
              <div className="text-center pt-10">
                <Smile size={20} className="text-violet-400/20 mx-auto mb-2" />
                <p className="text-white/15 text-xs">Be the first to chat!</p>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="msg-in">
                <span className={`text-xs font-bold ${msg.user_name === "System" ? "text-amber-400" : getColor(msg.user_name)}`}>
                  {msg.user_name}
                </span>
                <span className="text-white/60 text-xs ml-1">{msg.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-3 flex-shrink-0"
            style={{borderTop:"1px solid rgba(124,58,237,0.15)"}}>
            <div className="flex gap-2 rounded-2xl px-3 py-2"
              style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}>
              <input value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 bg-transparent text-white text-xs outline-none placeholder-violet-400/20" />
              <button onClick={sendMessage} className="text-violet-400 hover:text-violet-300">
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCallRequests && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{background:"rgba(0,0,0,0.85)",backdropFilter:"blur(16px)"}}
          onClick={(e) => e.target === e.currentTarget && setShowCallRequests(false)}>
          <div className="w-full max-w-sm rounded-[28px] p-5 mb-2 relative overflow-hidden"
            style={{background:"linear-gradient(135deg,#0f0f20,#0a0a1a)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.8),transparent)"}} />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-base">Call Requests</h3>
                <p className="text-violet-400/50 text-xs mt-0.5">{callRequests.length} people waiting</p>
              </div>
              <button onClick={() => setShowCallRequests(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white"
                style={{background:"rgba(124,58,237,0.1)"}}>✕</button>
            </div>
            {callRequests.length === 0 ? (
              <div className="text-center py-8">
                <Phone size={22} className="text-violet-400/20 mx-auto mb-2" />
                <p className="text-white/20 text-sm">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {callRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0"
                      style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                      {req.caller_name[0]?.toUpperCase()}
                    </div>
                    <span className="flex-1 text-white font-semibold text-sm">{req.caller_name}</span>
                    <button onClick={() => acceptCall(req)}
                      className="text-white text-xs px-3 py-1.5 rounded-xl font-bold"
                      style={{background:"linear-gradient(135deg,#059669,#0d9488)"}}>
                      Accept
                    </button>
                    <button onClick={() => rejectCall(req)}
                      className="text-white/40 text-xs px-3 py-1.5 rounded-xl hover:text-white"
                      style={{background:"rgba(255,255,255,0.05)"}}>
                      Decline
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}