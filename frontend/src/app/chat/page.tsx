'use client';
import React, { useState, useRef } from 'react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function sendTextMessage() {
    if (!input.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), sender: 'user', content: input };
    setMessages((m) => [...m, newMsg]);
    setInput('');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMsg.content }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: Date.now(), sender: 'bot', content: data.reply || '...' }]);
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now(), sender: 'bot', content: 'Error connecting to AI.' }]);
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(blob);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function sendVoiceMessage(blob: Blob) {
    const newMsg: ChatMessage = { id: Date.now(), sender: 'user', content: '[Voice message]' };
    setMessages((m) => [...m, newMsg]);

    const formData = new FormData();
    formData.append('file', blob, 'voice.webm');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/message`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: Date.now(), sender: 'bot', content: data.reply || '...' }]);
    } catch (err) {

      setMessages((m) => [...m, { id: Date.now(), sender: 'bot', content: 'Error sending voice message.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-persianGreen text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">Bot is typing...</div>}
      </div>

      <div className="flex items-center gap-2 p-4 bg-white border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg p-2"
          onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
        />
        <button
          onClick={sendTextMessage}
          className="px-4 py-2 bg-persianGreen text-white rounded-lg"
        >
          Send
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg ${recording ? 'bg-red-500 text-white' : 'bg-solar text-black'}`}
        >
          {recording ? 'Stop' : '🎙️ Voice'}
        </button>
      </div>
    </div>
  );
}
