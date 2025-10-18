"use client";

import { Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
          sender === "user"
            ? "bg-persianGreen text-black"
            : "bg-white text-gray-800 shadow"
        }`}
      >
        {isVoice ? (
          <div className="flex items-center gap-2">
            <Mic size={18} className="text-gray-600" />
            {formattedDuration && (
              <span className="text-xs text-gray-500">{formattedDuration}</span>
            )}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
