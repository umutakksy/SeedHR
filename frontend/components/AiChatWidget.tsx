"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiChatMessage, aiAPI } from "@/lib/api";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { clsx } from "clsx";

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const loadHistory = async () => {
    const res = await aiAPI.getChatHistory();
    if (res.success && res.data.length > 0) {
      setMessages(res.data);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: AiChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await aiAPI.chat(input.trim());
      if (res.success) {
        const botMsg: AiChatMessage = {
          id: "msg_" + (Date.now() + 1),
          role: "assistant",
          content: res.data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      const errMsg: AiChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    await aiAPI.clearHistory();
    setMessages([]);
  };

  const quickQuestions = [
    "İzin hakkım ne kadar?",
    "Uzaktan çalışma kuralları nedir?",
    "Maaş bordromu görmek istiyorum",
    "Eğitim bütçesi hakkında bilgi",
  ];

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 group"
        title="SeedHR AI Asistan"
      >
        <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute" />
        </span>
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "fixed z-50 transition-all duration-300",
        isMinimized
          ? "bottom-6 right-6 w-72"
          : "bottom-6 right-6 w-[400px] h-[580px]"
      )}
    >
      <div className={clsx(
        "bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden",
        isMinimized ? "h-auto" : "h-full"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">SeedHR AI Asistan</h3>
              <p className="text-[10px] text-indigo-200">İK politikaları hakkında soru sorun</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isMinimized && messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Sohbeti Temizle"
              >
                <Trash2 size={12} className="text-white/70" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {isMinimized ? <Maximize2 size={12} className="text-white/70" /> : <Minimize2 size={12} className="text-white/70" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-white/70" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Merhaba! 👋</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mb-5">SeedHR İK Asistanı ile şirket politikaları hakkında konuşun</p>
                  
                  <div className="space-y-2">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={async () => {
                          const userMsg: AiChatMessage = { id: "msg_" + Date.now(), role: "user", content: q, timestamp: new Date().toISOString() };
                          setMessages(prev => [...prev, userMsg]);
                          setIsTyping(true);
                          try {
                            const res = await aiAPI.chat(q);
                            if (res.success) {
                              const botMsg: AiChatMessage = { id: "msg_" + (Date.now() + 1), role: "assistant", content: res.data.reply, timestamp: new Date().toISOString() };
                              setMessages(prev => [...prev, botMsg]);
                            }
                          } catch {}
                          setIsTyping(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={clsx("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={clsx(
                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "user"
                      ? "bg-indigo-100 dark:bg-indigo-950/30"
                      : "bg-violet-100 dark:bg-violet-950/30"
                  )}>
                    {msg.role === "user"
                      ? <User size={12} className="text-indigo-600 dark:text-indigo-400" />
                      : <Bot size={12} className="text-violet-600 dark:text-violet-400" />
                    }
                  </div>
                  <div className={clsx(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-md"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-tl-md"
                  )}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    <p className={clsx(
                      "text-[9px] mt-1",
                      msg.role === "user" ? "text-indigo-200" : "text-slate-400 dark:text-zinc-500"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                    <Bot size={12} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="bg-slate-100 dark:bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-zinc-800 p-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bir soru sorun..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-600/20 shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 dark:text-zinc-500 mt-2">SeedHR AI · Çevrimdışı mod aktif</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
