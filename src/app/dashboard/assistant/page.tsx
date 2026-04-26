"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCheck, Send, Plus, MessageSquare, Loader2 } from "lucide-react";

import { DEFAULT_LANGUAGE, DEFAULT_THEME, INDIAN_LANGUAGES, getStoredTheme } from "@/lib/indian-languages";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

const PREDEFINED_PROMPTS = [
  "Am I eligible to vote?",
  "How do I update my address on Voter ID?",
  "What documents do I need to register?",
  "When is the last date to register in Gujarat?",
];

const STORAGE_LANGUAGE_KEY = "voteeasy-language";

export default function AssistantPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];
  const isDark = theme === "Dark";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_LANGUAGE_KEY);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const syncPreferences = async () => {
      try {
        const response = await fetch("/api/settings", { credentials: "include" });
        if (!response.ok) {
          throw new Error("Unable to load assistant settings");
        }

        const data = await response.json();
        setLanguage(data.preferences?.language ?? DEFAULT_LANGUAGE);
        setTheme(getStoredTheme(data.preferences?.theme));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/chat/history");
        if (res.ok) {
          const data = await res.json();
          setChats(data.chats);
          if (data.chats.length > 0) {
            setActiveChatId(data.chats[0].id);
          } else {
            handleNewChat();
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    syncPreferences();
    fetchHistory();
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getStoredTheme(window.localStorage.getItem("voteeasy-theme")));
      const savedLanguage = window.localStorage.getItem(STORAGE_LANGUAGE_KEY);
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("voteeasy-settings-updated", syncTheme as EventListener);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("voteeasy-settings-updated", syncTheme as EventListener);
    };
  }, []);

  const persistAssistantLanguage = async (nextLanguage: string) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(STORAGE_LANGUAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event("voteeasy-settings-updated"));

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: nextLanguage }),
      });
    } catch (error) {
      console.error("Failed to persist assistant language", error);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/history", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setChats((prev) => [data.chat, ...prev]);
        setActiveChatId(data.chat.id);
      }
    } catch (err) {
      console.error("Failed to create new chat", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeChatId) return;

    const tempId = Date.now().toString();
    const userMsg: Message = { id: tempId, role: "user", content: text };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, userMsg] };
        }
        return chat;
      }),
    );
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: activeChatId, message: text, language }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = data.message;

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChatId) {
              return { ...chat, messages: [...chat.messages, aiMsg] };
            }
            return chat;
          }),
        );

        if (messages.length === 0) {
          fetch("/api/chat/history")
            .then((r) => r.json())
            .then((d) => setChats(d.chats))
            .catch((error) => console.error("Failed to refresh chats", error));
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I am having trouble connecting to the server right now. Please try again later.",
      };
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return { ...chat, messages: [...chat.messages, errorMsg] };
          }
          return chat;
        }),
      );
    } finally {
      setIsTyping(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <Loader2 className="animate-spin text-[#f05a1a]" size={32} />
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-6xl h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 ${isDark ? "text-white" : ""}`}>
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div>
          <h1 className={`text-[28px] font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>AI Assistant</h1>
        </div>

        <div>
          <label className={`text-[12px] font-semibold mb-1 block uppercase tracking-wide ${isDark ? "text-[#a4acb6]" : "text-[#666]"}`}>
            Language / भाषा
          </label>
          <select
            value={language}
            onChange={(e) => persistAssistantLanguage(e.target.value)}
            className={`w-full rounded-[8px] border px-3 py-2 text-[14px] focus:outline-none focus:border-[#f05a1a] ${
              isDark ? "border-[#303743] bg-[#171a1d] text-white" : "border-[#e5e5e5] bg-white text-[#1a1a1a]"
            }`}
          >
            {INDIAN_LANGUAGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.nativeLabel})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[8px] bg-[#1a1a1a] text-white text-[14px] font-semibold hover:bg-[#333] transition-colors"
        >
          <Plus size={18} /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 mt-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[8px] transition-colors ${
                activeChatId === chat.id
                  ? isDark
                    ? "bg-[#242a33] text-white font-medium border border-[#303743]"
                    : "bg-[#f5f0eb] text-[#1a1a1a] font-medium border border-[#e5e5e5]"
                  : isDark
                    ? "text-[#a4acb6] hover:bg-[#171a1d] hover:text-white"
                    : "text-[#666] hover:bg-white hover:text-[#1a1a1a]"
              }`}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate text-[14px]">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`flex-1 rounded-[10px] flex flex-col overflow-hidden border ${
          isDark ? "bg-[#171a1d] border-[#303743] shadow-[0_1px_3px_rgba(0,0,0,0.35)]" : "bg-white border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDark ? "bg-[#111418]" : "bg-[#fcfcfc]"}`}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? "bg-[#242a33]" : "bg-[#f5f0eb]"}`}>
                <CheckCheck className="text-[#f05a1a] w-8 h-8" />
              </div>
              <div>
                <h3 className={`text-[18px] font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>VoteEasy Assistant</h3>
                <p className={`text-[14px] mt-1 max-w-sm ${isDark ? "text-[#a4acb6]" : "text-[#666]"}`}>
                  Hello! I&apos;m here to help you with voter registration, eligibility, and deadlines.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f05a1a] mt-1 shadow-sm">
                    <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-[12px] text-[15px] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#f05a1a] text-white rounded-tr-none"
                      : isDark
                        ? "bg-[#171a1d] text-white rounded-tl-none border border-[#303743]"
                        : "bg-white text-[#1a1a1a] rounded-tl-none border border-[#e5e5e5]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] gap-3 flex-row">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f05a1a] mt-1 shadow-sm">
                  <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
                </div>
                <div className={`px-5 py-4 rounded-[12px] shadow-sm rounded-tl-none border flex items-center gap-1.5 ${isDark ? "bg-[#171a1d] border-[#303743]" : "bg-white border-[#e5e5e5]"}`}>
                  <div className="w-2 h-2 bg-[#f05a1a] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#f05a1a] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#f05a1a] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && !isTyping && activeChatId && (
          <div className={`px-6 py-3 flex flex-wrap justify-center gap-2 border-t ${isDark ? "bg-[#171a1d] border-[#303743]" : "bg-white border-[#e5e5e5]"}`}>
            {PREDEFINED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[13px] text-[#f05a1a] bg-[#fff6f3] border border-[rgba(240,90,26,0.2)] rounded-full px-3 py-1.5 hover:bg-[rgba(240,90,26,0.1)] transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className={`p-4 border-t ${isDark ? "border-[#303743] bg-[#171a1d]" : "border-[#e5e5e5] bg-white"}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className={`flex-1 rounded-full border pl-5 pr-14 py-3 text-[15px] focus:outline-none focus:border-[#f05a1a] transition-colors shadow-sm ${
                isDark ? "border-[#303743] bg-[#111418] text-white" : "border-[#e5e5e5] bg-[#fcfcfc] text-[#1a1a1a] focus:bg-white"
              }`}
              disabled={!activeChatId}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || !activeChatId}
              className="absolute right-1.5 flex items-center justify-center h-10 w-10 rounded-full bg-[#f05a1a] text-white disabled:opacity-50 transition-colors hover:bg-[#d95117]"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

