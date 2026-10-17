"use client";

import { useEffect, useState } from "react";

type Slot = { id: string; slot_date: string; slot_time: string };

export default function BookingWidget() {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    if (open) {
      fetch("/api/book")
        .then((r) => r.json())
        .then((d) => setSlots(d.slots ?? []));
    }
  }, [open]);

  const submit = async () => {
    if (!selectedSlot || !name.trim() || !phone.trim()) return;
    setStatus("sending");
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selectedSlot.id, name, phone }),
    });
    setStatus(res.ok ? "done" : "error");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-[var(--clay)] px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
      >
        Book a visit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 p-4">
          <div className="animate-panel-in w-full max-w-sm rounded-lg bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">Book a visit</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--ink)]/50 hover:text-[var(--ink)]">
                ✕
              </button>
            </div>

            {status === "done" ? (
              <p className="text-sm text-[var(--available)]">
                Booked! We'll see you on {selectedSlot?.slot_date} at {selectedSlot?.slot_time}.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-[var(--ink)]/60">Choose a slot</p>
                <div className="mb-4 flex flex-col gap-1.5">
                  {slots.length === 0 && (
                    <p className="text-sm text-[var(--ink)]/40">No open slots right now.</p>
                  )}
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        selectedSlot?.id === s.id
                          ? "border-[var(--clay)] bg-[var(--clay)]/5"
                          : "border-[var(--line)]"
                      }`}
                    >
                      {s.slot_date} · {s.slot_time}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mb-1.5 w-full rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--clay)]"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="mb-3 w-full rounded-md border border-[var(--line)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--clay)]"
                    />
                    <button
                      onClick={submit}
                      disabled={status === "sending"}
                      className="w-full rounded-md bg-[var(--clay)] py-2 text-sm font-medium text-white disabled:bg-[var(--ink)]/20"
                    >
                      {status === "sending" ? "Booking..." : "Confirm booking"}
                    </button>
                    {status === "error" && (
                      <p className="mt-2 text-sm text-[var(--sold)]">
                        That slot was just taken. Please pick another.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}