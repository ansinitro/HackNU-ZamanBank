"use client";
import React, {useState, useRef} from "react";
import {convertAudioToText, sendMessage} from "@/lib/chatApi";
import MessageItem from "@/components/MessageItem"; // adjust path if needed

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
        const newMsg: ChatMessage = {id: Date.now(), sender: "user", content: text};

        if (addToChat) {
            setMessages((m) => [...m, newMsg]);
        }

        setInput("");
        setLoading(true);

        try {
            const data = await sendMessage(text, sessionId);
            setSessionId(data.session_id)
            setMessages((m) => [
                ...m,
                {id: Date.now(), sender: "bot", content: data.response || "..."},
            ]);

        } catch {
            setMessages((m) => [
                ...m,
                {id: Date.now(), sender: "bot", content: "Error connecting to AI."},
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];
            startTimeRef.current = Date.now();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, {type: "audio/webm"});
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
            {id: Date.now(), sender: "user", content: "[Voice message]", duration},
        ]);
        setLoading(true);

        try {
            const transcript = await convertAudioToText(blob);
            await sendTextMessage(transcript!!, false);
        } catch (err) {
            console.error("Voice message error:", err);
            setMessages((m) => [
                ...m,
                {id: Date.now(), sender: "bot", content: "Error processing audio."},
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full max-h-screen">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded">
                {messages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        sender={msg.sender}
                        content={msg.content}
                        duration={msg.duration}
                    />
                ))}
                {loading && <div className="text-gray-400 text-sm">Думаю...</div>}
            </div>

            <div className="flex items-center gap-2 p-4 bg-white border-t">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg p-2"
                    onKeyDown={(e) => e.key === "Enter" && sendTextMessage(input)}
                />
                <button
                    onClick={() => sendTextMessage(input)}
                    className="px-4 py-2 bg-persianGreen text-white rounded-lg"
                >
                    Send
                </button>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`px-4 py-2 rounded-lg ${
                        recording ? "bg-red-500 text-white" : "bg-solar text-black"
                    }`}
                >
                    {recording ? "Stop" : "🎙️ Voice"}
                </button>
            </div>
        </div>
    );
}
