"use client";
import { Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

interface MessageItemProps {
  sender: "user" | "bot";
  content: string;
  duration?: number; // seconds
}

export default function MessageItem({ sender, content, duration }: MessageItemProps) {
  const isVoice = content === "[Voice message]";
  const formattedDuration =
    duration !== undefined
      ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`
      : null;

  return (
    <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm transition-all duration-300 hover:scale-[1.02] ${
          sender === "user"
            ? "rounded-br-sm shadow-lg"
            : "rounded-bl-sm shadow-md"
        }`}
        style={{
          backgroundColor: sender === "user" ? ZamanColors.Solar : ZamanColors.Cloud,
          color: sender === "user" ? ZamanColors.DarkTeal : ZamanColors.DarkTeal,
          border: sender === "user" 
            ? `2px solid ${ZamanColors.PersianGreen}` 
            : `1px solid ${ZamanColors.LightTeal}`,
          boxShadow: sender === "user"
            ? `0 4px 12px ${ZamanColors.Solar}40`
            : `0 2px 8px ${ZamanColors.PersianGreen}15`,
        }}
      >
        {isVoice ? (
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: sender === "user" 
                  ? `${ZamanColors.PersianGreen}30` 
                  : `${ZamanColors.Solar}80` 
              }}
            >
              <Mic 
                size={18} 
                style={{ 
                  color: sender === "user" 
                    ? ZamanColors.PersianGreen 
                    : ZamanColors.DarkTeal 
                }} 
              />
            </div>
            {formattedDuration && (
              <span 
                className="text-xs font-medium"
                style={{ 
                  color: sender === "user" 
                    ? ZamanColors.DarkTeal 
                    : ZamanColors.PersianGreen 
                }}
              >
                {formattedDuration}
              </span>
            )}
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none"
            style={{
              '--tw-prose-body': sender === "user" ? ZamanColors.DarkTeal : ZamanColors.DarkTeal,
              '--tw-prose-headings': sender === "user" ? ZamanColors.DarkTeal : ZamanColors.PersianGreen,
              '--tw-prose-links': ZamanColors.PersianGreen,
              '--tw-prose-bold': sender === "user" ? ZamanColors.DarkTeal : ZamanColors.PersianGreen,
              '--tw-prose-code': ZamanColors.PersianGreen,
            } as React.CSSProperties}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}