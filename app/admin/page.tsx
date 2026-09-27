"use client";

import { useState } from "react";

type Plot = { id: string; plot_number: number; status: string };
type Slot = { id: string; slot_date: string; slot_time: string; is_booked: boolean };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const load = async (pw: string) => {
    const res = await fetch("/api/admin", { headers: { "x-admin-password": pw } });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    const data = await res.json();
    setPlots(data.plots ?? []);
    setSlots(data.slots ?? []);
    setAuthed(true);
    setError("");
  };

  const updateStatus = async (plotId: string, status: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ action: "update_plot_status", plotId, status }),
    });
    setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, status } : p)));
  };

  const addSlot = async () => {
    if (!newDate || !newTime) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ action: "add_slot", slotDate: newDate, slotTime: newTime }),
    });
    setNewDate("");
    setNewTime("");
    load(password);
  };

  const deleteSlot = async (slotId: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ action: "delete_slot", slotId }),
    });
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl font-bold">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(password)}
          placeholder="Password"
          className="mb-2 w-full rounded border px-2 py-1"
        />
        <button
          onClick={() => load(password)}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white"
        >
          Log in
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Plots</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {plots.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border p-2">
              <span>Plot {p.plot_number}</span>
              <select
                value={p.status}
                onChange={(e) => updateStatus(p.id, e.target.value)}
                className="rounded border px-2 py-1 text-sm"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="held">Held</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Time Slots</h2>
        <div className="mb-4 flex gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            type="text"
            placeholder="e.g. 10:00 AM"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded border px-2 py-1"
          />
          <button onClick={addSlot} className="rounded bg-green-600 px-3 py-1 text-white">
            Add Slot
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {slots.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>
                {s.slot_date} - {s.slot_time} {s.is_booked && <b className="text-red-600">(Booked)</b>}
              </span>
              <button onClick={() => deleteSlot(s.id)} className="text-red-600 underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}