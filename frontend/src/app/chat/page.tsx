"use client";
import React, { useState, useRef } from "react";
import { convertAudioToText, sendMessage } from "@/lib/chatApi";
import MessageItem from "@/components/MessageItem";
import { Send, Mic, Square } from "lucide-react";

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  content: string;
  duration?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);

  async function sendTextMessage(text: string, addToChat: boolean = true) {
    if (!text.trim()) return;

    const newMsg: ChatMessage = { id: Date.now(), sender: "user", content: text };

    if (addToChat) {
      setMessages((m) => [...m, newMsg]);
    }

    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(text, sessionId);
      setSessionId(data.session_id);
      setMessages((m) => [
        ...m,
        { id: Date.now(), sender: "bot", content: data.response || "..." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: Date.now(), sender: "bot", content: "Error connecting to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationSec = Math.round((Date.now() - (startTimeRef.current || 0)) / 1000);
        await sendVoiceMessage(blob, durationSec);
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied or not available.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function sendVoiceMessage(blob: Blob, duration: number) {
    setMessages((m) => [
      ...m,
      { id: Date.now(), sender: "user", content: "[Voice message]", duration },
    ]);
    setLoading(true);

    try {
      const transcript = await convertAudioToText(blob);
      await sendTextMessage(transcript!!, false);
    } catch (err) {
      console.error("Voice message error:", err);
      setMessages((m) => [
        ...m,
        { id: Date.now(), sender: "bot", content: "Error processing audio." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="flex flex-col h-full max-h-screen"
      style={{
        background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}20 100%)`,
      }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 shadow-md"
        style={{
          background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
          borderBottom: `3px solid ${ZamanColors.Solar}`,
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: ZamanColors.Solar }}>
          AI Chat Assistant
        </h1>
        <p className="text-sm mt-1" style={{ color: ZamanColors.LightTeal }}>
          Your intelligent banking companion
        </p>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{
          backgroundColor: `${ZamanColors.Cloud}`,
        }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                  boxShadow: `0 8px 24px ${ZamanColors.PersianGreen}40`,
                }}
              >
                <Mic size={32} style={{ color: ZamanColors.Solar }} />
              </div>
              <h2 className="text-xl font-semibold" style={{ color: ZamanColors.DarkTeal }}>
                Start a conversation
              </h2>
              <p className="text-sm" style={{ color: ZamanColors.PersianGreen }}>
                Type a message or use voice input
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            duration={msg.duration}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 px-4">
            <div 
              className="flex gap-1"
              style={{ color: ZamanColors.PersianGreen }}
            >
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
            </div>
            <span className="text-sm font-medium" style={{ color: ZamanColors.PersianGreen }}>
              Думаю...
            </span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div 
        className="px-6 py-4 shadow-2xl"
        style={{
          backgroundColor: ZamanColors.Cloud,
          borderTop: `2px solid ${ZamanColors.LightTeal}`,
        }}
      >
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:scale-[1.01]"
            style={{
              backgroundColor: `${ZamanColors.LightTeal}30`,
              border: `2px solid ${ZamanColors.LightTeal}`,
              color: ZamanColors.DarkTeal,
            }}
            onKeyDown={(e) => e.key === "Enter" && sendTextMessage(input)}
            onFocus={(e) => {
              e.target.style.borderColor = ZamanColors.PersianGreen;
              e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = ZamanColors.LightTeal;
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Send Button */}
          <button
            onClick={() => sendTextMessage(input)}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
              boxShadow: `0 4px 12px ${ZamanColors.PersianGreen}40`,
            }}
          >
            <Send size={20} style={{ color: ZamanColors.Solar }} />
          </button>

          {/* Voice Button */}
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className="px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              background: recording 
                ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
                : `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
              color: recording ? ZamanColors.Cloud : ZamanColors.DarkTeal,
              boxShadow: recording 
                ? '0 4px 12px rgba(239, 68, 68, 0.4)' 
                : `0 4px 12px ${ZamanColors.Solar}40`,
            }}
          >
            {recording ? (
              <>
                <Square size={18} fill="currentColor" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic size={18} />
                <span>Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: ${ZamanColors.LightTeal}30;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: ${ZamanColors.PersianGreen};
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: ${ZamanColors.DarkTeal};
        }
      `}</style>
    </div>
  );
}