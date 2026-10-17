"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ChatWidget from "../../ChatWidget";
import BookingWidget from "../../BookingWidget";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

type Villa = {
  id: string;
  villa_number: number;
  bhk: number;
  size_sqft: number;
  price: number;
  status: "available" | "sold" | "held";
  facing: string | null;
};

const statusBg: Record<string, string> = {
  available: "bg-[var(--available)]",
  sold: "bg-[var(--sold)]",
  held: "bg-[var(--held)]",
};

const statusBadge: Record<string, string> = {
  available: "bg-[var(--available)] text-white",
  sold: "bg-[var(--sold)] text-white",
  held: "bg-[var(--held)] text-[var(--ink)]",
};

const UNITS_PER_ROW = 18;
const crores = (n: number) => `₹${(n / 10000000).toFixed(2)} Cr`;

function scoreVilla(v: Villa, minPrice: number, maxSize: number) {
  let score = 0;
  score += (v.size_sqft / maxSize) * 40;
  score += (minPrice / v.price) * 40;
  score += (v.bhk / 6) * 20;
  return Math.round(score);
}

export default function SantoriniVillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selected, setSelected] = useState<Villa | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("villas")
      .select("*")
      .order("villa_number")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setVillas(data as Villa[]);
      });
  }, []);

  const stats = useMemo(() => {
    if (villas.length === 0) return null;
    const available = villas.filter((v) => v.status === "available");
    const bhks = villas.map((v) => v.bhk);
    const startingFrom = available.length ? Math.min(...available.map((v) => v.price)) : null;
    return {
      total: villas.length,
      available: available.length,
      bhkMin: Math.min(...bhks),
      bhkMax: Math.max(...bhks),
      startingFrom,
    };
  }, [villas]);

  const rows = useMemo(() => {
    const groups: Villa[][] = [];
    for (let i = 0; i < villas.length; i += UNITS_PER_ROW) {
      groups.push(villas.slice(i, i + UNITS_PER_ROW));
    }
    return groups;
  }, [villas]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const compareList = villas.filter((v) => compareIds.includes(v.id));

  const scored = useMemo(() => {
    if (compareList.length < 2) return [];
    const minPrice = Math.min(...compareList.map((v) => v.price));
    const maxSize = Math.max(...compareList.map((v) => v.size_sqft));
    return compareList
      .map((v) => ({ villa: v, score: scoreVilla(v, minPrice, maxSize) }))
      .sort((a, b) => b.score - a.score);
  }, [compareList]);

  const bestId = scored[0]?.villa.id;

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <header className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--ink)]">
              Santorini Villas - Mokila
            </h1>
            <p className="mt-1 max-w-md text-sm text-[var(--ink)]/60">
              126 villas across 7 rows, 4 to 6 BHK, facing east or west along the internal access lanes.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {stats && (
            <div className="mb-6 grid grid-cols-2 divide-x divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-white sm:grid-cols-4 sm:divide-y-0">
              <Stat label="Total villas" value={String(stats.total)} />
              <Stat label="Available now" value={String(stats.available)} />
              <Stat label="BHK range" value={`${stats.bhkMin}-${stats.bhkMax} BHK`} />
              <Stat label="Starting from" value={stats.startingFrom ? crores(stats.startingFrom) : "-"} />
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--available)]" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--sold)]" /> Sold
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--held)]" /> Held
            </span>
            <div className="ml-auto flex items-center gap-3">
              {compareIds.length > 0 && (
                <>
                  <button
                    onClick={() => setShowCompare(true)}
                    disabled={compareIds.length < 2}
                    className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-sm font-medium text-white disabled:bg-[var(--ink)]/20"
                  >
                    Compare {compareIds.length} villa{compareIds.length > 1 ? "s" : ""}
                  </button>
                  <button
                    onClick={() => setCompareIds([])}
                    className="text-sm text-[var(--ink)]/50 underline underline-offset-2"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-[var(--sold)]">Error: {error}</p>}

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
              <div className="h-1 bg-[var(--navy)]" />
              <div className="border-b border-[var(--line)] bg-[#dcd7c9] py-2 text-center text-xs text-[#4a4538]">
                — — — Main Entrance Road — — —
              </div>

              <div className="space-y-4 p-4">
                {rows.map((row, idx) => (
                  <div key={idx}>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--ink)]/40">
                      Row {idx + 1} · {row[0]?.facing} facing
                    </p>
                    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
                      {row.map((v) => (
                        <div key={v.id} className="relative">
                          <button
                            onClick={() => setSelected(v)}
                            className={`flex h-9 w-full items-center justify-center rounded-md text-xs font-semibold text-white ${
                              statusBg[v.status]
                            } ${selected?.id === v.id ? "ring-2 ring-[var(--clay)] ring-offset-1" : ""}`}
                          >
                            {v.villa_number}
                          </button>
                          <input
                            type="checkbox"
                            checked={compareIds.includes(v.id)}
                            onChange={() => toggleCompare(v.id)}
                            className="absolute -right-1 -top-1 h-3 w-3 accent-[var(--navy)]"
                            title={`Add villa ${v.villa_number} to compare`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="border-t border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]/40">
                Schematic site layout, for illustration only, confirm exact layout with the builder.
              </p>
            </div>

            <div className="md:sticky md:top-6 md:w-72 md:self-start">
              {selected ? (
                <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <h2 className="font-display text-lg font-medium">Villa {selected.villa_number}</h2>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                  <dl className="space-y-2 px-4 py-3 text-sm">
                    <Row label="Configuration" value={`${selected.bhk} BHK`} />
                    <Row label="Size" value={`${selected.size_sqft} sq ft`} />
                    <Row label="Facing" value={selected.facing ?? "Not available"} />
                    <div className="mt-2 flex items-baseline justify-between border-t border-[var(--line)] pt-2">
                      <span className="text-[var(--ink)]/60">Price</span>
                      <span className="font-mono-num text-base font-semibold">{crores(selected.price)}</span>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--line)] bg-white p-5">
                  <h2 className="font-display text-lg font-medium">Not sure which villa fits?</h2>
                  <p className="mt-1.5 text-sm text-[var(--ink)]/60">
                    Tell the advisor your budget, BHK or facing preference for a recommendation.
                  </p>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="mt-4 rounded-md bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white"
                  >
                    Start chatting
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 p-4">
            <div className="animate-panel-in max-h-[85vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">Compare villas</h2>
                <button onClick={() => setShowCompare(false)} className="rounded px-2 py-1 text-sm text-[var(--ink)]/50 hover:bg-[var(--paper)]">
                  Close
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scored.map(({ villa, score }) => (
                  <div key={villa.id} className={`rounded-lg border p-4 ${villa.id === bestId ? "border-[var(--clay)]" : "border-[var(--line)]"}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-display text-lg font-medium">Villa {villa.villa_number}</h3>
                      <span className={`rounded px-2 py-0.5 text-xs capitalize ${statusBadge[villa.status]}`}>{villa.status}</span>
                    </div>
                    {villa.id === bestId && (
                      <span className="mb-2 inline-block rounded bg-[var(--clay)] px-2 py-0.5 text-xs font-medium text-white">Best value</span>
                    )}
                    <dl className="space-y-1.5 text-sm">
                      <Row label="Configuration" value={`${villa.bhk} BHK`} />
                      <Row label="Size" value={`${villa.size_sqft} sq ft`} />
                      <Row label="Facing" value={villa.facing ?? "Not available"} />
                      <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-1.5">
                        <span className="text-[var(--ink)]/60">Price</span>
                        <span className="font-mono-num font-semibold">{crores(villa.price)}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-[var(--ink)]/50">
                        <span>Fit score</span>
                        <span className="font-mono-num">{score} / 100</span>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-[var(--ink)]/40">
                Score reflects size, price and bedroom count. Treat it as a starting point, not a substitute for a site visit.
              </p>
            </div>
          </div>
        )}

        <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
        <BookingWidget />
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[var(--ink)]/60">{label}</span>
      <span className="font-mono-num">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <div className="font-mono-num text-lg font-semibold">{value}</div>
      <div className="text-xs text-[var(--ink)]/50">{label}</div>
    </div>
  );
}