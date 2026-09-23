"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

// Turns a markdown-style table row like "| a | b | c |" into "a  b  c"
// and drops separator rows like "|---|---|---|" so replies read cleanly
// without a full markdown renderer.
function cleanMarkdown(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*\|?\s*-{2,}/.test(line))
    .map((line) => {
      if (line.trim().startsWith("|")) {
        return line
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
          .join("   ");
      }
      return line;
    })
    .join("\n");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Tell me your budget, size or facing preference and I'll suggest a plot." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const next: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't reach the assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="flex h-96 w-80 flex-col rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-3 text-white">
            <span className="font-semibold">Plot Advisor</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg p-2 text-sm ${
                  m.role === "user" ? "ml-auto bg-blue-100" : "bg-gray-100"
                }`}
              >
                <span style={{ whiteSpace: "pre-wrap" }}>
                  {m.role === "assistant" ? cleanMarkdown(m.content) : m.content}
                </span>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Typing...</div>}
          </div>
          <div className="flex gap-2 border-t p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about a plot..."
              className="flex-1 rounded border px-2 py-1 text-sm"
            />
            <button
              onClick={send}
              className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg"
        >
          💬 Ask Advisor
        </button>
      )}
    </div>
  );
}