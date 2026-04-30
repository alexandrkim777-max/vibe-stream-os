"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Mic, MicOff, Video, VideoOff, Phone,
  Users, Send, Heart, Share2, ArrowLeft, Smile, Zap
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
    body: JSON.stringify({ channelName, uid: 0, role }),
  });
  const data = await res.json();
  return data.token;
};

export default function StreamPage() {
  const params = useParams();
  const streamId = params.streamId as string;
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1284);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [callRequests, setCallRequests] = useState<any[]>([]);
  const [showCallRequests, setShowCallRequests] = useState(false);
  const [activeCaller, setActiveCaller] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "pending" | "accepted">("idle");
  const [userName, setUserName] = useState("Guest_" + Math.floor(Math.random() * 1000));
  const localVideoRef = useRef<HTMLDivElement>(null);
  const callerVideoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

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

    const msgChannel = supabase.channel(`stream-chat-${streamId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `stream_id=eq.${streamId}`
      }, (payload) => setChatMessages(prev => [...prev, payload.new]))
      .subscribe();

    const callChannel = supabase.channel(`call-requests-${streamId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "call_requests",
        filter: `stream_id=eq.${streamId}`
      }, () => fetchCallRequests())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(callChannel);
      leaveStream();
    };
  }, [streamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*")
      .eq("stream_id", streamId).order("created_at", { ascending: true }).limit(50);
    if (data) setChatMessages(data);
  };

  const fetchCallRequests = async () => {
    const { data } = await supabase.from("call_requests").select("*")
      .eq("stream_id", streamId).eq("status", "pending").order("created_at", { ascending: true });
    if (data) setCallRequests(data);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: userName, content: message
    });
    setMessage("");
  };

  const requestCall = async () => {
    setCallStatus("pending");
    await supabase.from("call_requests").insert({
      stream_id: streamId, caller_name: userName, status: "pending"
    });
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System",
      content: `📞 ${userName} wants to join the stream!`
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
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System",
      content: `❌ ${req.caller_name} was declined`
    });
  };

  const endCall = async () => {
    setActiveCaller(null);
    await supabase.from("messages").insert({
      stream_id: streamId, user_name: "System", content: "📞 Call ended"
    });
  };

  const joinStream = async () => {
    setIsLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && callerVideoRef.current) {
          user.videoTrack?.play(callerVideoRef.current);
          setActiveCaller(user.uid.toString());
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      client.on("user-unpublished", (user: any) => {
        setActiveCaller(null);
      });

      await client.setClientRole("host");
      const token = await getAgoraToken(streamId, "publisher");
      await client.join(appId, streamId, token, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];
      if (localVideoRef.current) videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);

      setIsJoined(true);
      setIsHost(true);

      await supabase.from("messages").insert({
        stream_id: streamId, user_name: "System",
        content: `🔴 Stream is live!`
      });
    } catch (e: any) {
      console.error(e);
      alert(`Camera error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const joinAsViewer = async () => {
    setIsLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && localVideoRef.current) {
          user.videoTrack?.play(localVideoRef.current);
        }
        if (mediaType === "audio") user.audioTrack?.play();
      });

      await client.setClientRole("audience", { level: 1 });
      const token = await getAgoraToken(streamId, "subscriber");
      await client.join(appId, streamId, token, null);
      setIsJoined(true);

      // Listen for call acceptance
      const myName = userName;
      supabase.channel(`my-call-${streamId}-${myName}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "call_requests",
          filter: `stream_id=eq.${streamId}`
        }, async (payload) => {
          if (
            payload.new.status === "accepted" &&
            payload.new.caller_name === myName
          ) {
            setCallStatus("accepted");
            try {
              await client.setClientRole("host");
              const newToken = await getAgoraToken(streamId, "publisher");
              await client.renewToken(newToken);
              const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
              localTracksRef.current = [audioTrack, videoTrack];
              await client.publish([audioTrack, videoTrack]);
              await supabase.from("messages").insert({
                stream_id: streamId, user_name: "System",
                content: `📹 ${myName} is now live on screen!`
              });
            } catch (e: any) {
              console.error("Call publish error:", e);
            }
          }
        })
        .subscribe();

    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    }
    setIsLoading(false);
  };

  const leaveStream = async () => {
    localTracksRef.current.forEach(t => { t.stop(); t.close(); });
    await clientRef.current?.leave();
    setIsJoined(false);
    setIsHost(false);
    setCallStatus("idle");
  };

  const toggleMic = async () => {
    const t = localTracksRef.current[0];
    if (t) { await t.setEnabled(!micOn); setMicOn(!micOn); }
  };

  const toggleCam = async () => {
    const t = localTracksRef.current[1];
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

      <nav className="relative z-10 flex items-center justify-between px-5 py-3"
        style={{borderBottom:"1px solid rgba(124,58,237,0.2)",background:"rgba(6,6,20,0.9)",backdropFilter:"blur(20px)"}}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="ctrl-btn" style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",width:36,height:36,borderRadius:12}}>
            <ArrowLeft size={15} className="text-violet-400" />
          </div>
          <span className="text-white/40 text-sm group-hover:text-white/70 transition-colors">Back</span>
        </Link>

        <div className="flex items-center gap-3">
          {isJoined && isHost && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)"}}>
              <div className="relative w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute inset-0 rounded-full bg-red-400" style={{animation:"pulseRing 1.5s ease-in-out infinite"}} />
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
            <span className="text-violet-300 text-xs font-semibold">312</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"rgba(167,139,250,0.9)"}}>
            {userName}
          </div>
          <button className="ctrl-btn text-white/40 hover:text-violet-400 transition-colors"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",width:36,height:36,borderRadius:12}}>
            <Share2 size={14} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`relative flex-1 min-h-0 ${activeCaller ? "grid grid-cols-2 gap-1.5 p-1.5" : ""}`}
            style={{background:"linear-gradient(135deg,#0d0628 0%,#080818 100%)"}}>

            <div className={`relative overflow-hidden ${activeCaller ? "rounded-2xl" : ""}`}
              style={!activeCaller ? {minHeight:"400px"} : {}}>
              <div ref={localVideoRef} className="absolute inset-0" />

              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-8">
                    <div className="relative w-32 h-32 mx-auto mb-8 float">
                      <div className="absolute -inset-4 rounded-full opacity-30"
                        style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(20px)"}} />
                      <div className="absolute -inset-2 rounded-full opacity-20 animate-ping"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}} />
                      <div className="relative w-full h-full rounded-full flex items-center justify-center text-5xl neon"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                        🎙
                      </div>
                    </div>
                    <p className="text-white/90 font-bold text-xl mb-2">Evening Stream</p>
                    <p className="text-white/30 text-sm mb-8">
                      You: <span className="text-violet-400 font-semibold">{userName}</span>
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={joinStream} disabled={isLoading}
                        className="flex items-center gap-2.5 text-white font-bold px-6 py-3.5 rounded-2xl disabled:opacity-40 liquid-btn neon"
                        style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                        {isLoading ? (
                          <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <><Video size={18} />Go Live</>
                        )}
                      </button>
                      <button onClick={joinAsViewer} disabled={isLoading}
                        className="flex items-center gap-2.5 text-white/70 font-semibold px-6 py-3.5 rounded-2xl disabled:opacity-40 liquid-btn"
                        style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)"}}>
                        <Users size={18} />Watch
                      </button>
                    </div>
                    <p className="text-white/15 text-xs mt-4">Viewers can call into your stream</p>
                  </div>
                </div>
              )}

              {isJoined && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={isHost
                      ? {background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",color:"rgb(252,165,165)"}
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
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-3 text-white"
                    style={{background:"linear-gradient(135deg,#059669,#0d9488)",boxShadow:"0 8px 32px rgba(5,150,105,0.5)"}}>
                    {typeof activeCaller === "string" ? activeCaller[0]?.toUpperCase() : "G"}
                  </div>
                  <p className="text-white/80 text-sm font-semibold">Guest</p>
                  <p className="text-emerald-400/60 text-xs mt-1">Live</p>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{background:"rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.4)",color:"rgb(52,211,153)"}}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    GUEST
                  </div>
                </div>
                <button onClick={endCall}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{background:"rgba(239,68,68,0.6)",border:"1px solid rgba(239,68,68,0.4)"}}>
                  <Phone size={13} className="text-white rotate-[135deg]" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 px-4 py-3.5 flex-wrap flex-shrink-0"
            style={{background:"rgba(6,6,20,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(124,58,237,0.15)"}}>

            <button onClick={toggleMic} className="ctrl-btn"
              style={{background: micOn ? "rgba(124,58,237,0.12)" : "rgba(239,68,68,0.4)", border:`1px solid ${micOn ? "rgba(124,58,237,0.3)" : "rgba(239,68,68,0.5)"}`}}>
              {micOn ? <Mic size={18} className="text-violet-300" /> : <MicOff size={18} className="text-white" />}
            </button>

            <button onClick={toggleCam} className="ctrl-btn"
              style={{background: camOn ? "rgba(124,58,237,0.12)" : "rgba(239,68,68,0.4)", border:`1px solid ${camOn ? "rgba(124,58,237,0.3)" : "rgba(239,68,68,0.5)"}`}}>
              {camOn ? <Video size={18} className="text-violet-300" /> : <VideoOff size={18} className="text-white" />}
            </button>

            <button onClick={() => { setLiked(!liked); setLikeCount(p => liked ? p-1 : p+1); }}
              className="ctrl-btn"
              style={{background: liked ? "rgba(236,72,153,0.35)" : "rgba(124,58,237,0.12)", border:`1px solid ${liked ? "rgba(236,72,153,0.5)" : "rgba(124,58,237,0.3)"}`}}>
              <Heart size={18} className={liked ? "text-pink-300 fill-pink-300" : "text-violet-300"} />
            </button>

            <span className="text-violet-400/50 text-xs font-semibold tabular-nums">{likeCount.toLocaleString()}</span>

            {isHost ? (
              <button onClick={() => setShowCallRequests(!showCallRequests)}
                className="relative flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-2xl text-sm liquid-btn"
                style={{background:"linear-gradient(135deg,#059669,#0d9488)",boxShadow:"0 8px 24px rgba(5,150,105,0.4)"}}>
                <Phone size={15} />
                Requests
                {callRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-bounce"
                    style={{background:"linear-gradient(135deg,#ef4444,#dc2626)"}}>
                    {callRequests.length}
                  </span>
                )}
              </button>
            ) : isJoined && callStatus === "idle" ? (
              <button onClick={requestCall}
                className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-2xl text-sm liquid-btn neon"
                style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                <Phone size={15} />
                Call Into Stream
              </button>
            ) : isJoined && callStatus === "pending" ? (
              <div className="flex items-center gap-2 text-yellow-400 font-bold px-5 py-2.5 rounded-2xl text-sm"
                style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.3)"}}>
                <Phone size={15} className="animate-pulse" />
                Waiting for host...
              </div>
            ) : isJoined && callStatus === "accepted" ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold px-5 py-2.5 rounded-2xl text-sm"
                style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)"}}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                You are On Air!
              </div>
            ) : null}

            {isJoined && (
              <button onClick={leaveStream} className="ctrl-btn"
                style={{background:"rgba(239,68,68,0.35)",border:"1px solid rgba(239,68,68,0.4)"}}>
                <Phone size={18} className="text-red-300 rotate-[135deg]" />
              </button>
            )}
          </div>
        </div>

        <div className="w-72 flex flex-col scrollbar-none flex-shrink-0"
          style={{background:"rgba(6,6,20,0.9)",backdropFilter:"blur(24px)",borderLeft:"1px solid rgba(124,58,237,0.15)"}}>
          <div className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
            <span className="text-white font-bold text-sm">Live Chat</span>
            <div className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"rgba(167,139,250,0.9)"}}>
              {userName}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 space-y-2 min-h-0">
            {chatMessages.length === 0 && (
              <div className="text-center pt-12">
                <Smile size={22} className="text-violet-400/20 mx-auto mb-2" />
                <p className="text-white/15 text-xs">Be the first to chat!</p>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="msg-in">
                <span className={`text-xs font-bold ${msg.user_name === "System" ? "text-amber-400" : getColor(msg.user_name)}`}>
                  {msg.user_name}
                </span>
                <span className="text-white/60 text-xs ml-1.5">{msg.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-3 flex-shrink-0" style={{borderTop:"1px solid rgba(124,58,237,0.15)"}}>
            <div className="flex gap-2 rounded-2xl px-3 py-2.5"
              style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}>
              <input value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 bg-transparent text-white text-xs outline-none placeholder-violet-400/20" />
              <button onClick={sendMessage} className="text-violet-400 hover:text-violet-300 transition-colors">
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
                style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>✕</button>
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
                      {req.caller_name[0].toUpperCase()}
                    </div>
                    <span className="flex-1 text-white font-semibold text-sm">{req.caller_name}</span>
                    <button onClick={() => acceptCall(req)}
                      className="text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all hover:scale-105"
                      style={{background:"linear-gradient(135deg,#059669,#0d9488)"}}>
                      Accept
                    </button>
                    <button onClick={() => rejectCall(req)}
                      className="text-white/40 text-xs px-3 py-1.5 rounded-xl font-medium hover:text-white transition-colors"
                      style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
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