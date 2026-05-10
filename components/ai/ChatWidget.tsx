'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStreamingChat } from '@/hooks/useStreamingChat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  'What services do you offer?',
  'How do I book an appointment?',
  'What are your working hours?',
  'How can I manage my staff?',
];

export function ChatWidget({ tenantId }: { tenantId: string }) {
  const [open, setOpen]                 = useState(false);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { stream } = useStreamingChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), streaming: true },
    ]);

    try {
      await stream({
        message: text.trim(),
        sessionToken,
        tenantId,
        onSession: (token) => setSessionToken(token),
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m),
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m),
          );
          setIsTyping(false);
        },
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false }
            : m,
        ),
      );
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center text-2xl"
        aria-label="Open AI Assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-24px)] h-[600px] max-h-[calc(100vh-120px)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <div>
              <p className="font-semibold text-sm">AI Assistant</p>
              <p className="text-xs opacity-75">Online · Powered by GPT-4o</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <p className="text-center text-sm text-muted-foreground">Hi! How can I help you today?</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-sm px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-current animate-pulse ml-0.5 rounded-sm align-middle" />
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className="flex-1 text-sm px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
