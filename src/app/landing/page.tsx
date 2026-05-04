"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Zap, Radio, Users, Phone, Shield, Star, ArrowRight, Play, Gamepad2, Plane, Briefcase, BookOpen, Palette, Baby, CheckCircle } from "lucide-react";

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
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        pulse: Math.random() * Math.PI * 2,
        color: ["167,139,250","99,102,241","236,72,153","14,165,233","52,211,153"][Math.floor(Math.random()*5)],
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

const DISTRICTS = [
  { icon: Gamepad2, label: "Gamer Zone", color: "#10b981", desc: "Live gaming, tournaments & esports" },
  { icon: Plane, label: "Travel Hub", color: "#0ea5e9", desc: "Explore the world together" },
  { icon: Briefcase, label: "Biz District", color: "#f97316", desc: "Networking & startup culture" },
  { icon: BookOpen, label: "University", color: "#a855f7", desc: "Learn from the best creators" },
  { icon: Palette, label: "Creative Hub", color: "#ec4899", desc: "Art, music & expression" },
  { icon: Baby, label: "Kids Zone", color: "#eab308", desc: "Safe content for young minds" },
];

const FEATURES = [
  {
    icon: Phone,
    title: "viCall — The Killer Feature",
    desc: "Any viewer can call into a live stream and become a co-host in real time. No gatekeeping. Pure authentic connection.",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.4)",
  },
  {
    icon: Shield,
    title: "AI-Powered Safety",
    desc: "Real-time content moderation across every stream. The safest platform for creators and viewers of all ages.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.4)",
  },
  {
    icon: Star,
    title: "District System",
    desc: "Themed zones for every passion. No more endless scrolling — find your community instantly.",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.4)",
  },
];

const STATS = [
  { value: "100M", label: "Users by 2028", color: "#7c3aed" },
  { value: "6", label: "Live Districts", color: "#10b981" },
  { value: "24/7", label: "AI Moderation", color: "#ec4899" },
  { value: "0ms", label: "Latency Goal", color: "#0ea5e9" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{background:"#060614"}}>
      <style>{`
        .scrollbar-none::-webkit-scrollbar{display:none}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 30px rgba(124,58,237,0.5)}50%{box-shadow:0 0 60px rgba(124,58,237,0.9),0 0 100px rgba(124,58,237,0.4)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .float{animation:float 5s ease-in-out infinite}
        .neon{animation:neonPulse 3s ease-in-out infinite}
        .slide-up{animation:slideUp .8s ease forwards}
        .fade-in{animation:fadeIn 1s ease forwards}
        .gradient-text{
          background:linear-gradient(135deg,#a78bfa,#818cf8,#ec4899,#a78bfa);
          background-size:300% 300%;
          animation:gradientShift 4s ease infinite;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .liquid-btn{transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
        .liquid-btn:hover{transform:scale(1.06) translateY(-3px)}
        .liquid-btn:active{transform:scale(0.97)}
        .card-hover{transition:all .4s ease}
        .card-hover:hover{transform:translateY(-8px)}
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-80 -left-80 w-[900px] h-[900px] rounded-full opacity-20"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)",filter:"blur(100px)"}} />
        <div className="absolute top-1/2 -right-60 w-[700px] h-[700px] rounded-full opacity-15"
          style={{background:"radial-gradient(circle,#4f46e5,transparent)",filter:"blur(100px)"}} />
        <div className="absolute -bottom-60 left-1/3 w-[600px] h-[600px] rounded-full opacity-10"
          style={{background:"radial-gradient(circle,#ec4899,transparent)",filter:"blur(100px)"}} />
        <Sparkles />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${scrolled ? "backdrop-blur-xl" : ""}`}
        style={scrolled ? {background:"rgba(6,6,20,0.9)",borderBottom:"1px solid rgba(124,58,237,0.2)"} : {}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center float neon"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-black text-xl text-white tracking-tight">VibeCity</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Districts", "How it Works", "Investors"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-white/50 hover:text-white text-sm font-medium transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth"
            className="text-white/60 hover:text-white text-sm font-semibold transition-colors hidden md:block">
            Sign In
          </Link>
          <Link href="/auth"
            className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-2xl liquid-btn text-sm"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 8px 24px rgba(124,58,237,0.4)"}}>
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 slide-up"
            style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Pre-Seed 2024</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight slide-up">
            <span className="text-white">The Future of</span>
            <br />
            <span className="gradient-text">Live Streaming</span>
            <br />
            <span className="text-white">is Here</span>
          </h1>

          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 slide-up leading-relaxed">
            VibeCity is the world&apos;s first AI-powered live streaming platform where viewers can
            <span className="text-violet-400 font-semibold"> call into any stream</span> and become a co-host in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 slide-up">
            <Link href="/auth"
              className="flex items-center gap-3 text-white font-black px-8 py-4 rounded-2xl liquid-btn text-base w-full sm:w-auto justify-center"
              style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 12px 40px rgba(124,58,237,0.5)"}}>
              <Radio size={20} />
              Start Streaming Free
            </Link>
            <Link href="/auth"
              className="flex items-center gap-3 text-white/70 font-semibold px-8 py-4 rounded-2xl liquid-btn text-base w-full sm:w-auto justify-center"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}>
              <Play size={18} />
              Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto slide-up">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 text-center card-hover"
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${stat.color}25`}}>
                <p className="text-2xl md:text-3xl font-black mb-1" style={{color:stat.color}}>{stat.value}</p>
                <p className="text-white/30 text-xs font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <p className="text-white text-xs">Scroll to explore</p>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-bold uppercase tracking-widest mb-4">Why VibeCity</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Built Different.<br />
              <span className="gradient-text">Built Better.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="relative rounded-3xl p-6 card-hover overflow-hidden"
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${f.color}20`}}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{background:`linear-gradient(90deg,transparent,${f.color},transparent)`}} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{background:`${f.color}20`,border:`1px solid ${f.color}30`}}>
                  <f.icon size={22} style={{color:f.color}} />
                </div>
                <h3 className="text-white font-black text-lg mb-3">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* viCall Section */}
      <section className="relative px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[32px] overflow-hidden p-8 md:p-12"
            style={{background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.1),rgba(6,6,20,0.9))",border:"1px solid rgba(124,58,237,0.3)"}}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.8),transparent)"}} />
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                  style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)"}}>
                  <Phone size={12} className="text-violet-400" />
                  <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">viCall</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                  The Killer<br />
                  <span className="gradient-text">Feature</span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-8">
                  Any viewer can call into a live stream and instantly become a co-host.
                  No gatekeeping, no barriers. Just pure authentic moments that go viral.
                </p>
                <div className="space-y-3">
                  {[
                    "One tap to call into any live stream",
                    "Instant split-screen co-hosting",
                    "Host controls who joins",
                    "Real-time audience reaction",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock UI */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[9/16] max-w-[240px] mx-auto"
                  style={{background:"linear-gradient(135deg,#0d0628,#080818)",border:"1px solid rgba(124,58,237,0.3)"}}>
                  {/* Host */}
                  <div className="h-1/2 relative flex items-center justify-center"
                    style={{background:"linear-gradient(135deg,#1a0533,#0d0628)"}}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                      style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                      🎙
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{background:"rgba(239,68,68,0.8)"}}>
                      <div className="w-1 h-1 rounded-full bg-white animate-pulse" />HOST
                    </div>
                  </div>
                  {/* Guest */}
                  <div className="h-1/2 relative flex items-center justify-center"
                    style={{background:"linear-gradient(135deg,#0a2818,#071a14)"}}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                      style={{background:"linear-gradient(135deg,#059669,#0d9488)"}}>
                      😊
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{background:"rgba(16,185,129,0.3)",border:"1px solid rgba(16,185,129,0.5)",color:"rgb(52,211,153)"}}>
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />GUEST
                    </div>
                  </div>
                  {/* Call button */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold neon"
                      style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
                      <Phone size={12} />Call Into Stream
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Districts */}
      <section id="districts" className="relative px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-bold uppercase tracking-widest mb-4">Explore</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              6 Unique<br />
              <span className="gradient-text">Districts</span>
            </h2>
            <p className="text-white/30 text-base mt-4 max-w-xl mx-auto">
              No more endless scrolling. Find your community instantly in themed zones built for every passion.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DISTRICTS.map((d) => (
              <div key={d.label} className="relative rounded-3xl p-5 card-hover overflow-hidden group cursor-pointer"
                style={{background:`linear-gradient(135deg,${d.color}12,rgba(6,6,20,0.9))`,border:`1px solid ${d.color}20`}}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{background:`radial-gradient(circle at center,${d.color}10,transparent 70%)`}} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{background:`linear-gradient(90deg,transparent,${d.color},transparent)`}} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{background:`linear-gradient(135deg,${d.color},${d.color}99)`,boxShadow:`0 8px 20px ${d.color}40`}}>
                  <d.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-black text-base mb-1">{d.label}</h3>
                <p className="text-white/30 text-xs leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-bold uppercase tracking-widest mb-4">Simple</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { step: "01", title: "Sign Up Free", desc: "Create your account in seconds. No credit card needed.", color: "#7c3aed" },
              { step: "02", title: "Choose Your District", desc: "Pick the community that matches your passion — gaming, travel, business and more.", color: "#10b981" },
              { step: "03", title: "Go Live or Watch", desc: "Start streaming instantly or watch other creators live in your district.", color: "#0ea5e9" },
              { step: "04", title: "Call Into Any Stream", desc: "Hit the viCall button and become a live co-host in any stream. Fame awaits.", color: "#ec4899" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6 p-6 rounded-3xl card-hover"
                style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${item.color}15`}}>
                <div className="text-4xl font-black flex-shrink-0" style={{color:`${item.color}40`}}>{item.step}</div>
                <div>
                  <h3 className="text-white font-black text-lg mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{background:`${item.color}20`,border:`1px solid ${item.color}30`}}>
                    <ArrowRight size={14} style={{color:item.color}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors CTA */}
      <section id="investors" className="relative px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-[32px] overflow-hidden p-8 md:p-16"
            style={{background:"linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.15),rgba(236,72,153,0.1))",border:"1px solid rgba(124,58,237,0.3)"}}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.9),transparent)"}} />
            <div className="absolute bottom-0 left-0 right-0 h-px"
              style={{background:"linear-gradient(90deg,transparent,rgba(236,72,153,0.5),transparent)"}} />

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)"}}>
              <Star size={12} className="text-violet-400" />
              <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">Pre-Seed Round Open</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Join Us in Building<br />
              <span className="gradient-text">The Future</span>
            </h2>

            <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              We are raising our pre-seed round to build the MVP and launch the first 3 Districts.
              Target: <span className="text-violet-400 font-bold">100M users by 2028</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth"
                className="flex items-center gap-3 text-white font-black px-8 py-4 rounded-2xl liquid-btn text-base w-full sm:w-auto justify-center"
                style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",boxShadow:"0 12px 40px rgba(124,58,237,0.5)"}}>
                <Radio size={18} />
                Try VibeCity Now
              </Link>
              <a href="mailto:invest@vibecity.app"
                className="flex items-center gap-3 text-white/60 font-semibold px-8 py-4 rounded-2xl liquid-btn text-base w-full sm:w-auto justify-center"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}>
                Contact Investors →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 md:px-12 py-8 text-center"
        style={{borderTop:"1px solid rgba(124,58,237,0.15)"}}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)"}}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-white">VibeCity</span>
        </div>
        <p className="text-white/20 text-xs">© 2024 VibeCity. Where content inspires and safety is guaranteed by AI.</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <Link href="/auth" className="text-white/30 hover:text-white text-xs transition-colors">Sign In</Link>
          <Link href="/" className="text-white/30 hover:text-white text-xs transition-colors">App</Link>
          <a href="mailto:hello@vibecity.app" className="text-white/30 hover:text-white text-xs transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}