"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Radio, MapPin, Users, Zap, MessageSquare, Bell, 
  Search, ChevronRight, Mic, Video, X, Send, Phone
} from "lucide-react";

const DISTRICTS = ["Чиланзар", "Юнусабад", "Мирзо-Улугбек", "Яккасарой", "Сергели"];

const LIVE_STREAMS = [
  { id: "1", host: "Азиз К.", district: "Чиланзар", title: "Вечерний разговор о районе", viewers: 312, avatar: "АК" },
  { id: "2", host: "Малика Р.", district: "Юнусабад", title: "Новости нашего квартала", viewers: 189, avatar: "МР" },
  { id: "3", host: "Санжар Б.", district: "Мирзо-Улугбек", title: "Стройка на ул. Навои", viewers: 540, avatar: "СБ" },
];

const MESSAGES = [
  { id: "1", name: "Камола", text: "Привет! Видела твой стрим вчера", time: "21:04", unread: 2 },
  { id: "2", name: "Дилшод", text: "Когда следующий эфир?", time: "20:51", unread: 0 },
  { id: "3", name: "Нилуфар", text: "Можешь позвать меня в эфир?", time: "19:30", unread: 1 },
];

const CHAT_MESSAGES = [
  { id: "1", from: "Камола", text: "Привет! Видела твой стрим вчера", mine: false },
  { id: "2", from: "Я", text: "Спасибо! Рад что понравилось", mine: true },
  { id: "3", from: "Камола", text: "Когда следующий?", mine: false },
];

function LiveBadge() {
  return (
    <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      Live
    </span>
  );
}

function StreamCard({ stream }: { stream: typeof LIVE_STREAMS[0] }) {
  return (
    <Link href={`/stream/${stream.id}`} className="block rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer hover:border-violet-500/40 hover:scale-105 transition-all duration-200">
      <div className="relative h-32 bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg border border-white/20">
          {stream.avatar}
        </div>
        <div className="absolute top-2 left-2"><LiveBadge /></div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5 text-white text-xs">
          <Users size={10} />{stream.viewers}
        </div>
      </div>
      <div className="p-3">
        <p className="text-white/90 text-sm font-medium leading-tight">{stream.title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <MapPin size={10} />{stream.district}
          </div>
          <span className="text-white/40 text-xs">{stream.host}</span>
        </div>
      </div>
    </Link>
  );
}

function ChatSidebar({ onClose }: { onClose: () => void }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  return (
    <div className="w-72 h-full border-l border-white/10 bg-black/60 backdrop-blur-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-violet-400" />
          <span className="text-white font-semibold text-sm">Сообщения</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {!activeChat ? (
        <div className="flex-1 overflow-y-auto">
          {MESSAGES.map((msg) => (
            <button key={msg.id} onClick={() => setActiveChat(msg.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {msg.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-white/90 text-sm font-medium">{msg.name}</span>
                  <span className="text-white/30 text-xs">{msg.time}</span>
                </div>
                <p className="text-white/40 text-xs truncate">{msg.text}</p>
              </div>
              {msg.unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center">
                  {msg.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <button onClick={() => setActiveChat(null)} className="text-white/40 hover:text-white">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">К</div>
            <span className="text-white text-sm font-medium">Камола</span>
            <button className="ml-auto text-white/40 hover:text-violet-400">
              <Phone size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {CHAT_MESSAGES.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${m.mine ? "bg-violet-600 text-white" : "bg-white/10 text-white/90"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-white/10">
            <div className="flex gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Написать..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30" />
              <button className="text-violet-400"><Send size={14} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState("Чиланзар");
  const [showGoLive, setShowGoLive] = useState(false);

  return (
    <div className="min-h-screen bg-[#080812] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-900/30" style={{filter:"blur(120px)"}} />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-900/25" style={{filter:"blur(100px)"}} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">Vibe City</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10 w-48">
          <Search size={13} className="text-white/30" />
          <input placeholder="Поиск..." className="bg-transparent text-sm text-white/70 outline-none placeholder-white/25 w-full" />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-white/8">
            <Bell size={16} className="text-white/60" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">ВЫ</div>
          <button onClick={() => setChatOpen(!chatOpen)}
            className={`p-2 rounded-full transition-colors ${chatOpen ? "bg-violet-600" : "hover:bg-white/8 text-white/60"}`}>
            <MessageSquare size={16} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1">
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {DISTRICTS.map((d) => (
              <button key={d} onClick={() => setActiveDistrict(d)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeDistrict === d ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 border border-white/10"}`}>
                {d}
              </button>
            ))}
          </div>

          <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/10 bg-gradient-to-r from-violet-900/80 via-indigo-900/60 to-slate-900/80 p-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-violet-400 text-sm">
                <MapPin size={13} />{activeDistrict}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Расскажи своему району</h1>
              <p className="text-white/50 text-sm">Выйди в прямой эфир — соседи ждут</p>
            </div>
            <button onClick={() => setShowGoLive(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl">
              <Radio size={16} />Выйти в эфир
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-semibold text-sm">Сейчас в эфире</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {LIVE_STREAMS.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </main>

        {chatOpen && <ChatSidebar onClose={() => setChatOpen(false)} />}
      </div>

      {showGoLive && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowGoLive(false)}>
          <div className="bg-[#0f0f1e] border border-white/15 rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Новый эфир</h3>
              <button onClick={() => setShowGoLive(false)} className="text-white/40"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Название эфира..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none" />
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm outline-none">
                {DISTRICTS.map((d) => <option key={d} className="bg-[#0f0f1e]">{d}</option>)}
              </select>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2.5 text-white/60 text-sm">
                  <Mic size={14} />Аудио
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2.5 text-white/60 text-sm">
                  <Video size={14} />Видео
                </button>
              </div>
              <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                <Radio size={15} />Начать эфир
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}