"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, full_name: username }
          }
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"#060614"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4)}50%{box-shadow:0 0 40px rgba(124,58,237,0.8)}}
        .float{animation:float 4s ease-in-out infinite}
        .neon{animation:neonPulse 3s ease-in-out infinite}
        .liquid-btn{transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
        .liquid-btn:hover{transform:scale(1.04) translateY(-2px)}
        .liquid-btn:active{transform:scale(0.97)}
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(80px)"}} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#4f46e5,transparent)",filter:"blur(80px)"}} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 float neon"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">VibeCity</h1>
          <p className="text-violet-400/50 text-sm mt-1">Where creators connect live</p>
        </div>

        {/* Card */}
        <div className="relative rounded-[28px] p-6 overflow-hidden"
          style={{background:"linear-gradient(135deg,#0f0820,#0a0614)",border:"1px solid rgba(124,58,237,0.3)",boxShadow:"0 40px 100px rgba(124,58,237,0.15)"}}>

          {/* Top neon line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.9),transparent)"}} />

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-2xl"
            style={{background:"rgba(124,58,237,0.08)"}}>
            <button onClick={() => setMode("login")}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={mode === "login"
                ? {background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"white",boxShadow:"0 4px 12px rgba(124,58,237,0.4)"}
                : {color:"rgba(255,255,255,0.3)"}}>
              Sign In
            </button>
            <button onClick={() => setMode("signup")}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={mode === "signup"
                ? {background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"white",boxShadow:"0 4px 12px rgba(124,58,237,0.4)"}
                : {color:"rgba(255,255,255,0.3)"}}>
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            {/* Username (signup only) */}
            {mode === "signup" && (
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/40" />
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your creator name"
                  className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-violet-400/20 outline-none transition-all"
                  style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}} />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/40" />
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-violet-400/20 outline-none transition-all"
                style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}} />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/40" />
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPass ? "text" : "password"}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm placeholder-violet-400/20 outline-none transition-all"
                style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)"}} />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400/40 hover:text-violet-400 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-2xl text-xs font-medium"
                style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(252,165,165,0.9)"}}>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="px-4 py-3 rounded-2xl text-xs font-medium"
                style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"rgba(52,211,153,0.9)"}}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleAuth} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 text-white font-black py-4 rounded-2xl text-base liquid-btn neon disabled:opacity-40"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 8px 32px rgba(124,58,237,0.4)"}}>
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-white/20 text-xs mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}