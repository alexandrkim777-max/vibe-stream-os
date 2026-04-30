"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Mic, MicOff, Video, VideoOff, Phone,
  Users, Send, Heart, Share2, ArrowLeft
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StreamPage() {
  const params = useParams();
  const streamId = params.streamId as string;
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [callRequests, setCallRequests] = useState<any[]>([]);
  const [showCallRequests, setShowCallRequests] = useState(false);
  const [activeCaller, setActiveCaller] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [userName] = useState("Guest_" + Math.floor(Math.random() * 1000));
  const localVideoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

  const appId = "cfc713c943fc449181f2bd2b9699aa27";
  const token = "007eJxTYKgzyv5vtbyL62PWaiER7rcumucP2zbe+FPoVWCZwPh79yMFhuS0ZHND42RLE+A0MLwzSjpBSjJEszS8vERCNzMfZPmQ2BjAzb0+qYGRkgEMRnZjA0MmZgAAAW7h4F";

  useEffect(() => {
    setMounted(true);
    fetchMessages();
    fetchCallRequests();

    const msgChannel = supabase
      .channel(`stream-chat-${streamId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `stream_id=eq.${streamId}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    const callChannel = supabase
      .channel(`call-requests-${streamId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "call_requests",
        filter: `stream_id=eq.${streamId}`
      }, () => {
        fetchCallRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(callChannel);
      leaveStream();
    };
  }, [streamId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("stream_id", streamId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (data) setChatMessages(data);
  };

  const fetchCallRequests = async () => {
    const { data } = await supabase
      .from("call_requests")
      .select("*")
      .eq("stream_id", streamId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (data) setCallRequests(data);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    await supabase.from("messages").insert({
      stream_id: streamId,
      user_name: userName,
      content: message,
    });
    setMessage("");
  };

  const requestCall = async () => {
    await supabase.from("call_requests").insert({
      stream_id: streamId,
      caller_name: userName,
      status: "pending"
    });
    alert("Request sent! Waiting for host to accept 📞");
  };

  const acceptCall = async (req: any) => {
    await supabase
      .from("call_requests")
      .update({ status: "accepted" })
      .eq("id", req.id);
    setActiveCaller(req.caller_name);
    setShowCallRequests(false);
    await supabase.from("messages").insert({
      stream_id: streamId,
      user_name: "System",
      content: `${req.caller_name} joined the stream!`
    });
  };

  const rejectCall = async (req: any) => {
    await supabase
      .from("call_requests")
      .update({ status: "rejected" })
      .eq("id", req.id);
  };

  const endCall = async () => {
    setActiveCaller(null);
    await supabase.from("messages").insert({
      stream_id: streamId,
      user_name: "System",
      content: "Call ended"
    });
  };

  const joinStream = async () => {
    setIsLoading(true);
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;
      await client.setClientRole("host");
      await client.join(appId, "stream-1", token, null);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      await client.publish([audioTrack, videoTrack]);
      setIsJoined(true);
      setIsHost(true);
    } catch (e) {
      console.error(e);
      alert("Camera connection error. Check browser permissions.");
    }
    setIsLoading(false);
  };

  const leaveStream = async () => {
    localTracksRef.current.forEach(track => {
      track.stop();
      track.close();
    });
    await clientRef.current?.leave();
    setIsJoined(false);
    setIsHost(false);
  };

  const toggleMic = async () => {
    const audioTrack = localTracksRef.current[0];
    if (audioTrack) {
      await audioTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCam = async () => {
    const videoTrack = localTracksRef.current[1];
    if (videoTrack) {
      await videoTrack.setEnabled(!camOn);
      setCamOn(!camOn);
    }
  };

  const COLORS = ["text-violet-400", "text-emerald-400", "text-pink-400", "text-amber-400", "text-blue-400"];
  const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#080812] text-white flex flex-col">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          {isJoined && (
            <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
          <span className="text-white/60 text-sm flex items-center gap-1">
            <Users size={13} />312
          </span>
        </div>
        <button className="text-white/60 hover:text-white">
          <Share2 size={18} />
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className={`relative flex-1 bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-slate-900 min-h-64 ${activeCaller ? "grid grid-cols-2 gap-1" : ""}`}>
            <div className="relative">
              <div ref={localVideoRef} className="absolute inset-0" />
              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white/20">
                      🎙
                    </div>
                    <p className="text-white/60 text-sm mb-2">Evening Stream</p>
                    <p className="text-white/30 text-xs mb-6">You: {userName}</p>
                    <button onClick={joinStream} disabled={isLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl mx-auto disabled:opacity-50">
                      {isLoading ? "Connecting..." : "▶ Join as Host"}
                    </button>
                  </div>
                </div>
              )}
              {isJoined && (
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur rounded-lg px-2 py-1">
                  <p className="text-white text-xs font-medium">Host</p>
                </div>
              )}
            </div>

            {activeCaller && (
              <div className="relative bg-gradient-to-br from-emerald-900/60 to-teal-900/60 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold mx-auto mb-2">
                    {activeCaller[0]}
                  </div>
                  <p className="text-white text-sm">{activeCaller}</p>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur rounded-lg px-2 py-1">
                  <p className="text-white text-xs font-medium">Guest</p>
                </div>
                <button onClick={endCall}
                  className="absolute top-3 right-3 bg-red-500/80 rounded-full p-1.5">
                  <Phone size={12} className="text-white rotate-[135deg]" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 py-4 border-t border-white/10 bg-black/40 flex-wrap">
            <button onClick={toggleMic}
              className={`p-3 rounded-full transition-all ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"}`}>
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button onClick={toggleCam}
              className={`p-3 rounded-full transition-all ${camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"}`}>
              {camOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button onClick={() => setLiked(!liked)}
              className={`p-3 rounded-full transition-all ${liked ? "bg-pink-500/80" : "bg-white/10 hover:bg-white/20"}`}>
              <Heart size={18} className={liked ? "fill-white" : ""} />
            </button>
            {isHost ? (
              <button onClick={() => setShowCallRequests(!showCallRequests)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-5 py-3 rounded-full text-sm">
                <Phone size={15} />
                Requests
                {callRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                    {callRequests.length}
                  </span>
                )}
              </button>
            ) : (
              <button onClick={requestCall}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-3 rounded-full text-sm">
                <Phone size={15} />
                Call Into Stream
              </button>
            )}
            {isJoined && (
              <button onClick={leaveStream} className="p-3 rounded-full bg-red-500/80 hover:bg-red-500">
                <Phone size={18} className="rotate-[135deg]" />
              </button>
            )}
          </div>
        </div>

        <div className="w-72 border-l border-white/10 bg-black/40 flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Live Chat</span>
            <span className="text-white/30 text-xs truncate ml-2">{userName}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {chatMessages.length === 0 && (
              <p className="text-white/20 text-xs text-center mt-4">Be the first to chat!</p>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className={`font-medium ${msg.user_name === "System" ? "text-yellow-400" : getColor(msg.user_name)}`}>
                  {msg.user_name}:{" "}
                </span>
                <span className="text-white/80">{msg.content}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-white/10">
            <div className="flex gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
              <input value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 bg-transparent text-white text-xs outline-none placeholder-white/25" />
              <button onClick={sendMessage} className="text-violet-400"><Send size={13} /></button>
            </div>
          </div>
        </div>
      </div>

      {showCallRequests && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCallRequests(false)}>
          <div className="bg-[#0f0f1e] border border-white/15 rounded-3xl p-5 w-full max-w-sm mb-4">
            <h3 className="text-white font-bold text-base mb-4">
              Call Requests
              <span className="ml-2 text-white/30 text-sm font-normal">{callRequests.length} people</span>
            </h3>
            {callRequests.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {callRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold">
                      {req.caller_name[0]}
                    </div>
                    <span className="flex-1 text-white font-medium text-sm">{req.caller_name}</span>
                    <button onClick={() => acceptCall(req)}
                      className="bg-emerald-500/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      Accept
                    </button>
                    <button onClick={() => rejectCall(req)}
                      className="bg-red-500/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
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