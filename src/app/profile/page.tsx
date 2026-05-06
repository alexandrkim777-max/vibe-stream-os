"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Camera, Save, Zap, Radio, Users, Star, Edit2 } from "lucide-react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

const AVATARS = ["🎮", "✈️", "💼", "📚", "🎨", "⭐", "🔥", "💫", "🎵", "🏆", "🦁", "🐉"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("🔥");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/auth");
      return;
    }
    const u = data.session.user;
    setUser(u);
    setUsername(u.user_metadata?.username || u.email?.split("@")[0] || "");
    setBio(u.user_metadata?.bio || "");
    setAvatar(u.user_metadata?.avatar || "🔥");
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username, bio, avatar }
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:"#060614"}}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{borderColor:"rgba(124,58,237,0.2)",borderTopColor:"#7c3aed"}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{background:"#060614"}}>
      <style>{`
        .liquid-btn{transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
        .liquid-btn:hover{transform:scale(1.04) translateY(-2px)}
        .liquid-btn:active{transform:scale(0.97)}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 40px rgba(124,58,237,0.7)}}
        .neon{animation:neonPulse 3s ease-in-out infinite}
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(80px)"}} />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#4f46e5,transparent)",filter:"blur(80px)"}} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3.5"
        style={{borderBottom:"1px solid rgba(124,58,237,0.2)",background:"rgba(6,6,20,0.9)",backdropFilter:"blur(20px)"}}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <ArrowLeft size={14} className="text-violet-400" />
          </div>
          <span className="text-white/40 text-sm group-hover:text-white/70 transition-colors">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center neon"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-white">VibeCity</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Profile header */}
        <div className="text-center mb-8">
          {/* Avatar selector */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto neon"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
              {avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
              <Edit2 size={12} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">{username || "Your Profile"}</h1>
          <p className="text-violet-400/50 text-sm">{user?.email}</p>
        </div>

        {/* Avatar picker */}
        <div className="rounded-3xl p-5 mb-4"
          style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.15)"}}>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Choose Avatar</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className="w-full aspect-square rounded-2xl flex items-center justify-center text-2xl liquid-btn transition-all"
                style={avatar === a
                  ? {background:"rgba(124,58,237,0.3)",border:"2px solid rgba(124,58,237,0.7)",boxShadow:"0 4px 16px rgba(124,58,237,0.3)"}
                  : {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl p-5 mb-4 space-y-4"
          style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.15)"}}>

          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Username</p>
            <input value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Your creator name"
              className="w-full rounded-2xl px-4 py-3 text-white text-sm placeholder-violet-400/20 outline-none transition-all"
              style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}} />
          </div>

          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Bio</p>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience about yourself..."
              rows={3}
              className="w-full rounded-2xl px-4 py-3 text-white text-sm placeholder-violet-400/20 outline-none transition-all resize-none"
              style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Radio, label: "Streams", value: "0" },
            { icon: Users, label: "Followers", value: "0" },
            { icon: Star, label: "Rating", value: "New" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{background:"rgba(124,58,237,0.06)",border:"1px solid rgba(124,58,237,0.15)"}}>
              <stat.icon size={16} className="text-violet-400 mx-auto mb-1" />
              <p className="text-white font-black text-lg">{stat.value}</p>
              <p className="text-white/30 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Save button */}
        <button onClick={saveProfile} disabled={saving}
          className="w-full text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base liquid-btn disabled:opacity-50"
          style={{
            background: saved
              ? "linear-gradient(135deg,#059669,#0d9488)"
              : "linear-gradient(135deg,#7c3aed,#4f46e5)",
            boxShadow: saved
              ? "0 8px 32px rgba(5,150,105,0.4)"
              : "0 8px 32px rgba(124,58,237,0.4)"
          }}>
          {saving ? (
            <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : saved ? (
            <><span>✓</span> Saved!</>
          ) : (
            <><Save size={18} />Save Profile</>
          )}
        </button>
      </div>
    </div>
  );
}