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
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-green-600 px-5 py-3 font-semibold text-white shadow-lg"
      >
        📅 Book a Visit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Book a Visit</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {status === "done" ? (
              <p className="text-green-700">
                Booked! We'll see you on {selectedSlot?.slot_date} at {selectedSlot?.slot_time}.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-600">Choose a slot</p>
                <div className="mb-4 flex flex-col gap-2">
                  {slots.length === 0 && (
                    <p className="text-sm text-gray-400">No open slots right now.</p>
                  )}
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded border px-3 py-2 text-left text-sm ${
                        selectedSlot?.id === s.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300"
                      }`}
                    >
                      {s.slot_date} - {s.slot_time}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mb-2 w-full rounded border px-2 py-1 text-sm"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="mb-3 w-full rounded border px-2 py-1 text-sm"
                    />
                    <button
                      onClick={submit}
                      disabled={status === "sending"}
                      className="w-full rounded bg-green-600 py-2 font-semibold text-white disabled:bg-gray-300"
                    >
                      {status === "sending" ? "Booking..." : "Confirm Booking"}
                    </button>
                    {status === "error" && (
                      <p className="mt-2 text-sm text-red-600">
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