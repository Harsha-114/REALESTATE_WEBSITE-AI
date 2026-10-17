"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

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

export default function ChatWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Tell me your budget, size or facing preference and I'll suggest a plot." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  useEffect(() => {
    if (open) {
      setShowNudge(false);
      return;
    }
    const showTimer = setTimeout(() => setShowNudge(true), 1200);
    const hideTimer = setTimeout(() => setShowNudge(false), 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [open]);

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

      const userMsgCount = next.filter((m) => m.role === "user").length;
      if (userMsgCount >= 2 && !showLeadForm && !leadSent) {
        setShowLeadForm(true);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't reach the assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendLead = async () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    const interestSummary = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" | ");

    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: leadName, phone: leadPhone, interestSummary }),
    });

    setShowLeadForm(false);
    setLeadSent(true);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "Thanks! Our team will reach out to you shortly." },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="animate-panel-in flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-lg">
          <div className="flex items-center justify-between bg-[var(--navy)] px-4 py-3 text-white">
            <span className="font-display font-medium">Plot Advisor</span>
            <button onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--navy)] text-white"
                    : "bg-[var(--paper)] text-[var(--ink)]"
                }`}
              >
                <span style={{ whiteSpace: "pre-wrap" }}>
                  {m.role === "assistant" ? cleanMarkdown(m.content) : m.content}
                </span>
              </div>
            ))}
            {loading && <div className="text-sm text-[var(--ink)]/40">Typing...</div>}

            {showLeadForm && (
              <div className="rounded-lg border border-[var(--clay)]/40 bg-[var(--clay)]/5 p-3 text-sm">
                <p className="mb-2 font-medium">Want our team to follow up?</p>
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="mb-1.5 w-full rounded border border-[var(--line)] px-2 py-1.5 text-sm outline-none focus:border-[var(--navy)]"
                />
                <input
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="Phone number"
                  className="mb-2.5 w-full rounded border border-[var(--line)] px-2 py-1.5 text-sm outline-none focus:border-[var(--navy)]"
                />
                <div className="flex gap-3">
                  <button
                    onClick={sendLead}
                    className="rounded-md bg-[var(--clay)] px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setShowLeadForm(false)}
                    className="text-sm text-[var(--ink)]/50 underline underline-offset-2"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-[var(--line)] p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about a plot..."
              className="flex-1 rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--navy)]"
            />
            <button
              onClick={send}
              className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-sm font-medium text-white"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <>
          {showNudge && (
            <div className="animate-panel-in absolute -top-16 right-0 w-56 rounded-lg border border-[var(--line)] bg-white p-3 text-sm shadow-lg">
              <button
                onClick={() => setShowNudge(false)}
                className="absolute right-1.5 top-1.5 text-[var(--ink)]/30 hover:text-[var(--ink)]/60"
                aria-label="Dismiss"
              >
                ✕
              </button>
              Ask the advisor which plot fits your budget and needs.
            </div>
          )}
          <button
            onClick={() => onOpenChange(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Ask the advisor
          </button>
        </>
      )}
    </div>
  );
}