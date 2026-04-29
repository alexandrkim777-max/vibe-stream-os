"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, Phone,
  Users, Send, Heart, Share2, ArrowLeft
} from "lucide-react";
import Link from "next/link";

const STREAM_CHAT = [
  { id: "1", name: "Камола", text: "Привет всем! 👋", color: "text-violet-400" },
  { id: "2", name: "Дилшод", text: "Огонь стрим!", color: "text-emerald-400" },
  { id: "3", name: "Санжар", text: "Когда следующий?", color: "text-pink-400" },
  { id: "4", name: "Малика", text: "Лайк поставила 🔥", color: "text-amber-400" },
];

export default function StreamPage() {
  const params = useParams();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState(STREAM_CHAT);
  const [showCallRequests, setShowCallRequests] = useState(false);
  const [callerActive, setCallerActive] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

  const appId = "cfc713c943fc449181f2bd2b9699aa27";
  const token = "007eJxTYEgMv7g1YsWJZP3lbyvefvkRplj7bbH0yeDyixdsn67xrPqhwJCclmxuaJxsaWKclmxiYmloYZhmlJRilGRpZmmZmGhknvTpY2ZDICNDioghIyMDBIL43AxhmUmpwSVFqYn+xQwMAF6+JUE=";

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
    } catch (e) {
      console.error(e);
      alert("Ошибка подключения камеры. Проверь разрешения браузера.");
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

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      name: "Вы",
      text: message,
      color: "text-violet-400"
    }]);
    setMessage("");
  };

  useEffect(() => {
    setMounted(true);
    return () => { leaveStream(); };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#080812] text-white flex flex-col">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Назад</span>
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
          <div className="relative flex-1 bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-slate-900 min-h-64">
            <div ref={localVideoRef} className="absolute inset-0" />

            {!isJoined && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white/20">
                    АК
                  </div>
                  <p className="text-white/60 text-sm mb-6">Азиз Каримов · Чиланзар</p>
                  <button
                    onClick={joinStream}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl mx-auto disabled:opacity-50"
                  >
                    {isLoading ? "Подключение..." : "▶ Войти в эфир"}
                  </button>
                </div>
              </div>
            )}

            {callerActive && (
              <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">К</div>
                  <p className="text-white text-xs">Камола</p>
                  <button onClick={() => setCallerActive(false)} className="mt-2 bg-red-500/80 rounded-full p-1.5">
                    <Phone size={10} className="text-white rotate-[135deg]" />
                  </button>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur rounded-xl px-3 py-2">
              <p className="text-white font-semibold text-sm">Вечерний разговор о районе</p>
              <p className="text-white/50 text-xs">Чиланзар</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-4 border-t border-white/10 bg-black/40">
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
            <button onClick={() => setShowCallRequests(!showCallRequests)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-3 rounded-full text-sm">
              <Phone size={15} />
              Позвонить в эфир
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">2</span>
            </button>
            {isJoined && (
              <button onClick={leaveStream} className="p-3 rounded-full bg-red-500/80 hover:bg-red-500">
                <Phone size={18} className="rotate-[135deg]" />
              </button>
            )}
          </div>
        </div>

        <div className="w-72 border-l border-white/10 bg-black/40 flex flex-col">
          <div className="px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">Чат эфира</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className={`font-medium ${msg.color}`}>{msg.name}: </span>
                <span className="text-white/80">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-white/10">
            <div className="flex gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
              <input value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Написать в чат..."
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
            <h3 className="text-white font-bold text-base mb-4">Запросы на звонок</h3>
            <div className="space-y-3">
              {[{id:"1",name:"Камола",avatar:"К"},{id:"2",name:"Дилшод",avatar:"Д"}].map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold">
                    {req.avatar}
                  </div>
                  <span className="flex-1 text-white font-medium">{req.name}</span>
                  <button onClick={() => { setCallerActive(true); setShowCallRequests(false); }}
                    className="bg-emerald-500/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    Принять
                  </button>
                  <button className="bg-red-500/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    Отклонить
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}