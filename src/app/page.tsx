"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Radio, Users, Zap, MessageSquare, Bell, Search, Mic, Video, X, Send, Phone, MapPin, Gamepad2, Plane, Briefcase, BookOpen, Palette, Baby } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DISTRICTS = [
  { id: "all", label: "All Districts", icon: Zap, color: "from-violet-500 to-indigo-500", bg: "bg-violet-500/10" },
  { id: "gaming", label: "Gamer Zone", icon: Gamepad2, color: "from-green-500 to-emerald-500", bg: "bg-green-500/10" },
  { id: "travel", label: "Travel Hub", icon: Plane, color: "from-sky-500 to-blue-500", bg: "bg-sky-500/10" },
  { id: "business", label: "Biz District", icon: Briefcase, color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  { id: "education", label: "University", icon: BookOpen, color: "from-violet-500 to-purple-500", bg: "bg-violet-500/10" },
  { id: "creative", label: "Creative Hub", icon: Palette, color: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
  { id: "kids", label: "Kids Zone", icon: Baby, color: "from-yellow-500 to-amber-500", bg: "bg-yellow-500/10" },
];

const MESSAGES = [
  { id: "1", name: "Kamola", text: "Loved your stream yesterday!", time: "9:04 PM", unread: 2 },
  { id: "2", name: "Dilshod", text: "When is the next live?", time: "8:51 PM", unread: 0 },
  { id: "3", name: "Nilufar", text: "Can you call me into your stream?", time: "7:30 PM", unread: 1 },
];

const CHAT_MESSAGES = [
  { id: "1", from: "Kamola", text: "Loved your stream yesterday!", mine: false },
  { id: "2", from: "Me", text: "Thanks! Glad you enjoyed it", mine: true },
  { id: "3", from: "Kamola", text: "When is the next one?", mine: false },
];

function LiveBadge() {
  return (
    <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      Live
    </span>
  );
}

function StreamCard({ stream }: { stream: any }) {
  const district = DISTRICTS.find(d => d.id === stream.district) || DISTRICTS[1];
  const Icon = district.icon;
  return (
    <Link href={`/stream/${stream.id}`} className="block group">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className={`relative h-40 bg-gradient-to-br ${district.color} opacity-20 absolute inset-0`} />
        <div className={`relative h-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${district.color} opacity-10`} />
          <div className="relative z-10 text-center">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${district.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
              <Icon size={24} className="text-white" />
            </div>
            <div className="text-white/60 text-xs">{stream.host_name}</div>
          </div>
          <div className="absolute top-3 left-3"><LiveBadge /></div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-2 py-1 text-white text-xs">
            <Users size={10} />{stream.viewer_count}
          </div>
        </div>
        <div className="p-4">
          <p className="text-white/90 text-sm font-semibold leading-tight mb-2">{stream.title}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${district.color} bg-clip-text text-transparent border border-white/10 font-medium`}>
              {district.label}
            </span>
            <span className="text-white/30 text-xs">{stream.host_name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ChatSidebar({ onClose }: { onClose: () => void }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  return (
    <div className="w-80 h-full border-l border-white/8 bg-black/40 backdrop-blur-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-violet-400" />
          <span className="text-white font-semibold text-sm">Messages</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">
          <X size={14} />
        </button>
      </div>
      {!activeChat ? (
        <div className="flex-1 overflow-y-auto">
          {MESSAGES.map((msg) => (
            <button key={msg.id} onClick={() => setActiveChat(msg.id)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {msg.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-white/90 text-sm font-medium">{msg.name}</span>
                  <span className="text-white/25 text-xs">{msg.time}</span>
                </div>
                <p className="text-white/35 text-xs truncate">{msg.text}</p>
              </div>
              {msg.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {msg.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8">
            <button onClick={() => setActiveChat(null)} className="text-white/30 hover:text-white">←</button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">K</div>
            <span className="text-white text-sm font-medium">Kamola</span>
            <button className="ml-auto text-white/30 hover:text-violet-400"><Phone size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {CHAT_MESSAGES.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.mine ? "bg-violet-600 text-white rounded-br-sm" : "bg-white/8 text-white/90 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/8">
            <div className="flex gap-2 bg-white/6 rounded-2xl px-4 py-2.5 border border-white/10">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Write a message..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25" />
              <button className="text-violet-400 hover:text-violet-300"><Send size={14} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState("all");
  const [showGoLive, setShowGoLive] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDistrict, setStreamDistrict] = useState("gaming");

  useEffect(() => { fetchStreams(); }, []);

  const fetchStreams = async () => {
    const { data } = await supabase.from("streams").select("*").eq("status", "live").order("created_at", { ascending: false });
    if (data) setStreams(data);
    setLoading(false);
  };

  const filteredStreams = activeDistrict === "all" ? streams : streams.filter(s => s.district === activeDistrict);
  const activeD = DISTRICTS.find(d => d.id === activeDistrict) || DISTRICTS[0];

  return (
    <div className="min-h-screen text-white flex flex-col" style={{background: "radial-gradient(ellipse at top left, #1a0533 0%, #080812 40%, #070714 100%)"}}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full" style={{background:"radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)"}} />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full" style={{background:"radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)"}} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full" style={{background:"radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)"}} />
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",backgroundSize:"64px 64px"}} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/6 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">VibeCity</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/6 rounded-2xl px-4 py-2.5 border border-white/8 w-56 backdrop-blur">
          <Search size={13} className="text-white/30" />
          <input placeholder="Search streams..." className="bg-transparent text-sm text-white/70 outline-none placeholder-white/25 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 rounded-2xl hover:bg-white/8 transition-colors">
            <Bell size={16} className="text-white/50" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
          </button>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold cursor-pointer">YOU</div>
          <button onClick={() => setChatOpen(!chatOpen)}
            className={`p-2.5 rounded-2xl transition-colors ${chatOpen ? "bg-violet-600 text-white" : "hover:bg-white/8 text-white/50"}`}>
            <MessageSquare size={16} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {DISTRICTS.map((d) => {
              const Icon = d.icon;
              return (
                <button key={d.id} onClick={() => setActiveDistrict(d.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    activeDistrict === d.id
                      ? `bg-gradient-to-r ${d.color} text-white shadow-lg`
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/8"}`}>
                  <Icon size={14} />
                  {d.label}
                </button>
              );
            })}
          </div>

          <div className="relative rounded-[28px] overflow-hidden mb-8 border border-white/8 p-8 flex items-center justify-between"
            style={{background:"linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(79,70,229,0.2) 50%, rgba(17,17,40,0.8) 100%)"}}>
            <div className="absolute inset-0 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <activeD.icon size={14} className="text-white/60" />
                <span className="text-white/60 text-sm font-medium">{activeD.label}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Go Live Now</h1>
              <p className="text-white/40 text-sm">Your audience is waiting — start your stream</p>
            </div>
            <button onClick={() => setShowGoLive(true)}
              className="relative z-10 flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 shadow-xl"
              style={{background:"linear-gradient(135deg, #7c3aed, #4f46e5)"}}>
              <Radio size={16} />
              Go Live
            </button>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-white font-semibold text-sm">Live Now</h2>
              <span className="text-white/25 text-xs">{filteredStreams.length} streams</span>
            </div>
          </div>

          {loading ? (
            <div className="text-white/25 text-sm text-center py-16">Loading streams...</div>
          ) : filteredStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-white/20 text-4xl mb-3">📡</div>
              <p className="text-white/30 text-sm">No live streams in this district yet</p>
              <button onClick={() => setShowGoLive(true)} className="mt-4 text-violet-400 text-sm hover:text-violet-300">Be the first to go live →</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filteredStreams.map((stream) => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          )}
        </main>

        {chatOpen && <ChatSidebar onClose={() => setChatOpen(false)} />}
      </div>

      {showGoLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.8)", backdropFilter:"blur(12px)"}}
          onClick={(e) => e.target === e.currentTarget && setShowGoLive(false)}>
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 p-6" style={{background:"linear-gradient(135deg, #0f0f20, #0a0a1a)"}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Start a Stream</h3>
              <button onClick={() => setShowGoLive(false)} className="text-white/30 hover:text-white w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Stream title..."
                className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors" />
              <div className="grid grid-cols-2 gap-2">
                {DISTRICTS.filter(d => d.id !== "all").map((d) => {
                  const Icon = d.icon;
                  return (
                    <button key={d.id} onClick={() => setStreamDistrict(d.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                        streamDistrict === d.id
                          ? `bg-gradient-to-r ${d.color} text-white`
                          : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/10"}`}>
                      <Icon size={12} />{d.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/8 rounded-2xl py-3 text-white/50 text-sm hover:bg-white/10 transition-colors">
                  <Mic size={14} />Audio
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/8 rounded-2xl py-3 text-white/50 text-sm hover:bg-white/10 transition-colors">
                  <Video size={14} />Video
                </button>
              </div>
              <button className="w-full text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{background:"linear-gradient(135deg, #7c3aed, #4f46e5)"}}>
                <Radio size={15} />Start Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}