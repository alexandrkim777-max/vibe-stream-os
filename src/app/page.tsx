"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Radio, Users, Zap, MessageSquare, Bell, Search, Mic, Video, X, Send, Phone, Gamepad2, Plane, Briefcase, BookOpen, Palette, Baby, ChevronRight, TrendingUp, LogOut, Menu } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DISTRICTS = [
  { id: "all", label: "All Districts", icon: Zap, color: "#7c3aed", glow: "rgba(124,58,237,0.5)" },
  { id: "gaming", label: "Gamer Zone", icon: Gamepad2, color: "#10b981", glow: "rgba(16,185,129,0.5)" },
  { id: "travel", label: "Travel Hub", icon: Plane, color: "#0ea5e9", glow: "rgba(14,165,233,0.5)" },
  { id: "business", label: "Biz District", icon: Briefcase, color: "#f97316", glow: "rgba(249,115,22,0.5)" },
  { id: "education", label: "University", icon: BookOpen, color: "#a855f7", glow: "rgba(168,85,247,0.5)" },
  { id: "creative", label: "Creative Hub", icon: Palette, color: "#ec4899", glow: "rgba(236,72,153,0.5)" },
  { id: "kids", label: "Kids Zone", icon: Baby, color: "#eab308", glow: "rgba(234,179,8,0.5)" },
];

const MESSAGES = [
  { id: "1", name: "Kamola", text: "Loved your stream!", time: "9:04 PM", unread: 2 },
  { id: "2", name: "Dilshod", text: "When is the next live?", time: "8:51 PM", unread: 0 },
  { id: "3", name: "Nilufar", text: "Call me into your stream!", time: "7:30 PM", unread: 1 },
];

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
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        pulse: Math.random() * Math.PI * 2,
        color: ["167,139,250","99,102,241","236,72,153","14,165,233"][Math.floor(Math.random()*4)],
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.015;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const o = 0.15 + 0.3 * Math.sin(p.pulse);
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

function BackgroundPaths() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity:0.15}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0"/>
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="pg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0"/>
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M-100,150 C200,80 400,250 700,120 S1100,30 1400,180" stroke="url(#pg1)" strokeWidth="1.5" fill="none">
        <animate attributeName="d" dur="8s" repeatCount="indefinite"
          values="M-100,150 C200,80 400,250 700,120 S1100,30 1400,180;M-100,200 C200,130 400,180 700,200 S1100,100 1400,130;M-100,150 C200,80 400,250 700,120 S1100,30 1400,180"/>
      </path>
      <path d="M-100,350 C300,280 500,420 800,300 S1200,200 1500,350" stroke="url(#pg2)" strokeWidth="1" fill="none">
        <animate attributeName="d" dur="11s" repeatCount="indefinite"
          values="M-100,350 C300,280 500,420 800,300 S1200,200 1500,350;M-100,300 C300,380 500,300 800,380 S1200,280 1500,300;M-100,350 C300,280 500,420 800,300 S1200,200 1500,350"/>
      </path>
    </svg>
  );
}

function StreamCard({ stream }: { stream: any }) {
  const district = DISTRICTS.find(d => d.id === stream.district) || DISTRICTS[1];
  const Icon = district.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/stream/${stream.id}`} className="block group">
      <div className="relative rounded-3xl overflow-hidden transition-all duration-500"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: hovered ? `1px solid ${district.color}50` : "1px solid rgba(255,255,255,0.07)",
          transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 20px 50px ${district.glow}30` : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div className="relative h-40 sm:h-48 flex items-center justify-center overflow-hidden"
          style={{background:`linear-gradient(135deg, ${district.color}18 0%, #060614 100%)`}}>
          <div className="absolute inset-0 transition-opacity duration-500"
            style={{background:`radial-gradient(circle at center, ${district.color}20, transparent 70%)`,opacity: hovered ? 1 : 0}} />
          <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
            style={{background:`linear-gradient(90deg,transparent,${district.color},transparent)`, opacity: hovered ? 1 : 0}} />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-300"
              style={{
                background:`linear-gradient(135deg, ${district.color}, ${district.color}99)`,
                boxShadow: hovered ? `0 0 30px ${district.glow}` : `0 8px 20px ${district.color}30`,
                transform: hovered ? "scale(1.15) rotate(-3deg)" : "scale(1) rotate(0deg)"
              }}>
              <Icon size={22} className="text-white" />
            </div>
            <p className="text-white/50 text-xs font-medium">{stream.host_name}</p>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{background:"rgba(239,68,68,0.9)"}}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{background:"rgba(0,0,0,0.7)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <Users size={10} className="text-white/60" />
            <span className="text-white/80 text-xs font-semibold">{stream.viewer_count?.toLocaleString()}</span>
          </div>
          {stream.viewer_count > 400 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
              style={{background:`${district.color}25`,border:`1px solid ${district.color}40`}}>
              <TrendingUp size={9} style={{color:district.color}} />
              <span className="text-[10px] font-bold" style={{color:district.color}}>Hot</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-white/90 text-sm font-bold mb-2 sm:mb-3 leading-tight line-clamp-2">{stream.title}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{background:`${district.color}15`,border:`1px solid ${district.color}35`,color:district.color}}>
              {district.label}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{background:`linear-gradient(135deg,${district.color},${district.color}99)`}}>
                {stream.host_name?.[0]}
              </div>
              <span className="text-white/30 text-xs hidden sm:block">{stream.host_name}</span>
            </div>
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
    <div className="fixed inset-0 z-40 md:relative md:inset-auto md:w-80 md:h-full flex flex-col"
      style={{background:"rgba(6,6,20,0.98)",backdropFilter:"blur(24px)",borderLeft:"1px solid rgba(124,58,237,0.2)"}}>
      <div className="flex items-center justify-between px-5 py-4"
        style={{borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <MessageSquare size={13} className="text-violet-400" />
          </div>
          <span className="text-white font-bold text-sm">Messages</span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-xl text-white/30 hover:text-white transition-all"
          style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
          <X size={13} />
        </button>
      </div>
      {!activeChat ? (
        <div className="flex-1 overflow-y-auto">
          {MESSAGES.map((msg) => (
            <button key={msg.id} onClick={() => setActiveChat(msg.id)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all hover:bg-violet-500/5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                {msg.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-white/90 text-sm font-semibold">{msg.name}</span>
                  <span className="text-white/20 text-xs">{msg.time}</span>
                </div>
                <p className="text-white/30 text-xs truncate">{msg.text}</p>
              </div>
              {msg.unread > 0 && (
                <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                  {msg.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-5 py-3"
            style={{borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
            <button onClick={() => setActiveChat(null)} className="text-violet-400/60 hover:text-violet-400 text-lg">←</button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>K</div>
            <span className="text-white text-sm font-semibold">Kamola</span>
            <button className="ml-auto text-violet-400/40 hover:text-violet-400"><Phone size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {[
              { id:"1", text:"Loved your stream!", mine:false },
              { id:"2", text:"Thanks! Glad you enjoyed it", mine:true },
              { id:"3", text:"When is the next one?", mine:false },
            ].map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium"
                  style={m.mine
                    ? {background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"white"}
                    : {background:"rgba(124,58,237,0.1)",color:"rgba(255,255,255,0.8)",border:"1px solid rgba(124,58,237,0.2)"}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3" style={{borderTop:"1px solid rgba(124,58,237,0.15)"}}>
            <div className="flex gap-2 rounded-2xl px-4 py-2.5"
              style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-transparent text-white text-xs outline-none placeholder-violet-400/20" />
              <button className="text-violet-400 hover:text-violet-300"><Send size={13} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState("all");
  const [showGoLive, setShowGoLive] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDistrict, setStreamDistrict] = useState("gaming");
  const [isCreatingStream, setIsCreatingStream] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchStreams();
    const channel = supabase
      .channel("streams-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "streams" }, () => fetchStreams())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/auth");
    } else {
      setUser(data.session.user);
    }
    setAuthLoading(false);
  };

  const fetchStreams = async () => {
    const { data } = await supabase.from("streams").select("*").eq("status", "live").order("created_at", { ascending: false });
    if (data) setStreams(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      alert("Please enter a stream title!");
      return;
    }
    setIsCreatingStream(true);
    try {
      const hostName = user?.user_metadata?.username || user?.email?.split("@")[0] || "Creator";
      const { data, error } = await supabase.from("streams").insert({
        title: streamTitle,
        district: streamDistrict,
        host_name: hostName,
        status: "live",
        viewer_count: 0,
      }).select().single();
      if (error) throw error;
      setShowGoLive(false);
      setStreamTitle("");
      router.push(`/stream/${data.id}?host=true`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setIsCreatingStream(false);
  };

  const filteredStreams = activeDistrict === "all" ? streams : streams.filter(s => s.district === activeDistrict);
  const activeD = DISTRICTS.find(d => d.id === activeDistrict) || DISTRICTS[0];
  const ActiveIcon = activeD.icon;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:"#060614"}}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={28} className="text-white" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 mx-auto animate-spin"
            style={{borderColor:"rgba(124,58,237,0.2)",borderTopColor:"#7c3aed"}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{background:"#060614"}}>
      <style>{`
        .scrollbar-none::-webkit-scrollbar{display:none}
        .scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 40px rgba(124,58,237,0.7)}}
        .float{animation:float 5s ease-in-out infinite}
        .neon-pulse{animation:neonPulse 3s ease-in-out infinite}
        .liquid-btn{transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
        .liquid-btn:hover{transform:scale(1.06) translateY(-2px)}
        .liquid-btn:active{transform:scale(0.97)}
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(80px)"}} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#4f46e5,transparent)",filter:"blur(80px)"}} />
        <BackgroundPaths />
        <Sparkles />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 md:py-4"
        style={{borderBottom:"1px solid rgba(124,58,237,0.2)",backdropFilter:"blur(20px)",background:"rgba(6,6,20,0.9)"}}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center float neon-pulse"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="font-black text-lg md:text-xl text-white tracking-tight">VibeCity</span>
            <div className="hidden md:flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/70 text-[10px] font-semibold uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2.5 rounded-2xl px-4 py-2.5 w-64"
          style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}>
          <Search size={14} className="text-violet-400/50" />
          <input placeholder="Search streams..."
            className="bg-transparent text-sm text-white/80 outline-none placeholder-violet-400/25 w-full" />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Search icon on mobile */}
          <button className="md:hidden p-2 rounded-xl"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <Search size={15} className="text-violet-400/70" />
          </button>

          <button className="relative p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all hover:scale-110"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <Bell size={15} className="text-violet-400/70" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{background:"#ef4444"}} />
          </button>

          {/* User - show initial on mobile */}
          <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl md:rounded-2xl"
            style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl flex items-center justify-center text-xs font-black text-white"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
              {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden md:block text-white/70 text-xs font-semibold max-w-[80px] truncate">
              {user?.user_metadata?.username || user?.email?.split("@")[0] || "User"}
            </span>
          </div>

          <button onClick={() => setChatOpen(!chatOpen)}
            className="p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all hover:scale-110"
            style={chatOpen
              ? {background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}
              : {background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <MessageSquare size={15} className={chatOpen ? "text-white" : "text-violet-400/70"} />
          </button>

          <button onClick={handleSignOut}
            className="p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all hover:scale-110"
            style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)"}}>
            <LogOut size={15} className="text-red-400/70" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-6 py-4 md:py-6">

          {/* Districts */}
          <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto scrollbar-none pb-1">
            {DISTRICTS.map((d) => {
              const Icon = d.icon;
              const isActive = activeDistrict === d.id;
              return (
                <button key={d.id} onClick={() => setActiveDistrict(d.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all liquid-btn"
                  style={isActive ? {
                    background:`linear-gradient(135deg,${d.color},${d.color}bb)`,
                    color:"white",
                    boxShadow:`0 6px 20px ${d.glow}50`,
                  } : {
                    background:"rgba(255,255,255,0.04)",
                    color:"rgba(255,255,255,0.35)",
                    border:"1px solid rgba(255,255,255,0.07)"
                  }}>
                  <Icon size={12} />
                  <span className="whitespace-nowrap">{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Hero */}
          <div className="relative rounded-[20px] md:rounded-[28px] overflow-hidden mb-6 md:mb-8 p-5 md:p-8 flex items-center justify-between"
            style={{
              background:`linear-gradient(135deg, ${activeD.color}20 0%, rgba(79,70,229,0.1) 60%, rgba(6,6,20,0.95) 100%)`,
              border:`1px solid ${activeD.color}25`,
            }}>
            <BackgroundPaths />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center"
                  style={{background:`${activeD.color}25`,border:`1px solid ${activeD.color}40`}}>
                  <ActiveIcon size={10} style={{color:activeD.color}} />
                </div>
                <span className="text-xs md:text-sm font-semibold" style={{color:activeD.color}}>{activeD.label}</span>
              </div>
              <h1 className="text-xl md:text-3xl font-black text-white mb-1 md:mb-2 tracking-tight">Go Live Now</h1>
              <p className="text-white/30 text-xs md:text-sm hidden sm:block">
                Welcome, <span className="text-violet-400 font-semibold">
                  {user?.user_metadata?.username || user?.email?.split("@")[0] || "Creator"}
                </span> 👋
              </p>
            </div>
            <button onClick={() => setShowGoLive(true)}
              className="relative z-10 flex items-center gap-2 text-white font-bold px-4 md:px-7 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl liquid-btn text-sm md:text-base"
              style={{
                background:`linear-gradient(135deg,${activeD.color},${activeD.color}cc)`,
                boxShadow:`0 8px 24px ${activeD.glow}40`
              }}>
              <Radio size={14} />
              <span className="hidden sm:block">Go Live</span>
              <span className="sm:hidden">Live</span>
            </button>
          </div>

          {/* Live Now */}
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500" />
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
              </div>
              <span className="text-white font-bold text-sm">Live Now</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(252,165,165,0.9)"}}>
                {filteredStreams.length}
              </span>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold"
              style={{color:activeD.color}}>
              See all <ChevronRight size={12} />
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{borderColor:"rgba(124,58,237,0.2)",borderTopColor:"#7c3aed"}} />
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4"
                style={{background:`${activeD.color}15`,border:`1px solid ${activeD.color}25`}}>
                <ActiveIcon size={22} style={{color:activeD.color}} />
              </div>
              <p className="text-white/20 text-sm mb-4">No live streams yet</p>
              <button onClick={() => setShowGoLive(true)}
                className="text-sm font-semibold flex items-center gap-1 mx-auto liquid-btn px-4 py-2 rounded-xl"
                style={{color:activeD.color,background:`${activeD.color}10`,border:`1px solid ${activeD.color}25`}}>
                Be the first <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredStreams.map((stream) => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          )}
        </main>

        {/* Chat sidebar */}
        {chatOpen && <ChatSidebar onClose={() => setChatOpen(false)} />}
      </div>

      {/* Go Live Modal */}
      {showGoLive && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{background:"rgba(0,0,0,0.88)",backdropFilter:"blur(20px)"}}
          onClick={(e) => e.target === e.currentTarget && setShowGoLive(false)}>
          <div className="w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] p-6 relative overflow-hidden"
            style={{background:"linear-gradient(135deg,#0f0820,#0a0614)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.9),transparent)"}} />
            
            {/* Handle for mobile */}
            <div className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden"
              style={{background:"rgba(255,255,255,0.2)"}} />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-black text-lg md:text-xl">Start Streaming</h3>
                <p className="text-violet-400/40 text-xs mt-0.5">Go live in seconds ⚡</p>
              </div>
              <button onClick={() => setShowGoLive(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white liquid-btn"
                style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <input value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="What is your stream about?"
                className="w-full rounded-2xl px-4 py-3 text-white text-sm placeholder-violet-400/20 outline-none"
                style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}}
                onKeyDown={(e) => e.key === "Enter" && handleGoLive()} />

              <div className="grid grid-cols-2 gap-2">
                {DISTRICTS.filter(d => d.id !== "all").map((d) => {
                  const Icon = d.icon;
                  const isSelected = streamDistrict === d.id;
                  return (
                    <button key={d.id} onClick={() => setStreamDistrict(d.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold liquid-btn"
                      style={isSelected ? {
                        background:`${d.color}20`,border:`1px solid ${d.color}50`,color:d.color,
                      } : {
                        background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)"
                      }}>
                      <Icon size={12} />{d.label}
                    </button>
                  );
                })}
              </div>

              <button onClick={handleGoLive} disabled={isCreatingStream}
                className="w-full text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base liquid-btn neon-pulse disabled:opacity-50"
                style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 8px 32px rgba(124,58,237,0.4)"}}>
                {isCreatingStream ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <><Radio size={18} />Start Streaming Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}