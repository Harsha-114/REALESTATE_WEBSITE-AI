"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ChatWidget from "../../ChatWidget";
import BookingWidget from "../../BookingWidget";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

type Plot = {
  id: string;
  plot_number: number;
  size_sqyd: number;
  facing: string | null;
  road_width_ft: number;
  is_corner: boolean;
  price_per_sqyd: number;
  status: "available" | "sold" | "held";
  map_x: number;
  map_y: number;
};

const IMG_W = 875;
const IMG_H = 1280;

const statusDot: Record<string, string> = {
  available: "bg-[var(--available)]",
  sold: "bg-[var(--sold)]",
  held: "bg-[var(--held)]",
};

const statusBadge: Record<string, string> = {
  available: "bg-[var(--available)] text-white",
  sold: "bg-[var(--sold)] text-white",
  held: "bg-[var(--held)] text-[var(--ink)]",
};

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function scorePlot(p: Plot, minPrice: number, maxSize: number) {
  let score = 0;
  score += (p.size_sqyd / maxSize) * 40;
  score += (minPrice / p.price_per_sqyd) * 40;
  score += p.is_corner ? 10 : 0;
  score += (p.road_width_ft / 40) * 10;
  return Math.round(score);
}

export default function SyNo18Page() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selected, setSelected] = useState<Plot | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("plots")
      .select("*")
      .order("plot_number")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setPlots(data as Plot[]);
      });
  }, []);

  const stats = useMemo(() => {
    if (plots.length === 0) return null;
    const available = plots.filter((p) => p.status === "available");
    const sizes = plots.map((p) => p.size_sqyd);
    const startingFrom = available.length
      ? Math.min(...available.map((p) => p.price_per_sqyd * p.size_sqyd))
      : null;
    return {
      total: plots.length,
      available: available.length,
      sizeMin: Math.min(...sizes),
      sizeMax: Math.max(...sizes),
      startingFrom,
    };
  }, [plots]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const compareList = plots.filter((p) => compareIds.includes(p.id));

  const scored = useMemo(() => {
    if (compareList.length < 2) return [];
    const minPrice = Math.min(...compareList.map((p) => p.price_per_sqyd));
    const maxSize = Math.max(...compareList.map((p) => p.size_sqyd));
    return compareList
      .map((p) => ({ plot: p, score: scorePlot(p, minPrice, maxSize) }))
      .sort((a, b) => b.score - a.score);
  }, [compareList]);

  const bestId = scored[0]?.plot.id;

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <header className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--ink)]">
              Sy No 18 - Indrakaran
            </h1>
            <p className="mt-1 max-w-md text-sm text-[var(--ink)]/60">
              Explore each plot, compare a few side by side, or ask the advisor for a recommendation.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {stats && (
            <div className="mb-6 grid grid-cols-2 divide-x divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-white sm:grid-cols-4 sm:divide-y-0">
              <Stat label="Total plots" value={String(stats.total)} />
              <Stat label="Available now" value={String(stats.available)} />
              <Stat label="Size range" value={`${stats.sizeMin}-${stats.sizeMax} sq yd`} />
              <Stat label="Starting from" value={stats.startingFrom ? rupees(stats.startingFrom) : "-"} />
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
                    className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-[var(--ink)]/20"
                  >
                    Compare {compareIds.length} plot{compareIds.length > 1 ? "s" : ""}
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
            <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-[var(--line)] bg-white">
              <div className="h-1 bg-[var(--navy)]" />
              <div className="relative p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/layout.jpg" alt="Layout map" className="w-full" />
                {plots.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      left: `${(p.map_x / IMG_W) * 100}%`,
                      top: `${(p.map_y / IMG_H) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <button
                      onClick={() => setSelected(p)}
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-sm ring-offset-1 ${
                        statusDot[p.status]
                      } ${selected?.id === p.id ? "ring-2 ring-[var(--clay)] ring-offset-1" : ""}`}
                    >
                      {p.plot_number}
                    </button>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(p.id)}
                      onChange={() => toggleCompare(p.id)}
                      className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 accent-[var(--navy)]"
                      title={`Add plot ${p.plot_number} to compare`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:sticky md:top-6 md:w-72 md:self-start">
              {selected ? (
                <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                  <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <h2 className="font-display text-lg font-medium">
                      Plot {selected.plot_number}
                    </h2>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[selected.status]}`}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <dl className="space-y-2 px-4 py-3 text-sm">
                    <Row label="Size" value={`${selected.size_sqyd} sq yd`} />
                    <Row label="Facing" value={selected.facing ?? "Not available"} />
                    <Row label="Road width" value={`${selected.road_width_ft} ft`} />
                    <Row label="Corner plot" value={selected.is_corner ? "Yes" : "No"} />
                    <Row label="Rate" value={`${rupees(selected.price_per_sqyd)} / sq yd`} />
                    <div className="mt-2 flex items-baseline justify-between border-t border-[var(--line)] pt-2">
                      <span className="text-[var(--ink)]/60">Total</span>
                      <span className="font-mono-num text-base font-semibold">
                        {rupees(selected.price_per_sqyd * selected.size_sqyd)}
                      </span>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--line)] bg-white p-5">
                  <h2 className="font-display text-lg font-medium">Not sure which plot fits?</h2>
                  <p className="mt-1.5 text-sm text-[var(--ink)]/60">
                    Tell the advisor your budget, size or facing and get a recommendation in seconds.
                  </p>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="mt-4 rounded-md bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  >
                    Start chatting
                  </button>
                  <p className="mt-4 text-xs text-[var(--ink)]/40">
                    Or click any plot on the map to see its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 p-4">
            <div className="animate-panel-in max-h-[85vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">Compare plots</h2>
                <button
                  onClick={() => setShowCompare(false)}
                  className="rounded px-2 py-1 text-sm text-[var(--ink)]/50 hover:bg-[var(--paper)]"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scored.map(({ plot, score }) => (
                  <div
                    key={plot.id}
                    className={`rounded-lg border p-4 ${
                      plot.id === bestId ? "border-[var(--clay)]" : "border-[var(--line)]"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-display text-lg font-medium">Plot {plot.plot_number}</h3>
                      <span className={`rounded px-2 py-0.5 text-xs capitalize ${statusBadge[plot.status]}`}>
                        {plot.status}
                      </span>
                    </div>
                    {plot.id === bestId && (
                      <span className="mb-2 inline-block rounded bg-[var(--clay)] px-2 py-0.5 text-xs font-medium text-white">
                        Best value
                      </span>
                    )}
                    <dl className="space-y-1.5 text-sm">
                      <Row label="Size" value={`${plot.size_sqyd} sq yd`} />
                      <Row label="Facing" value={plot.facing ?? "Not available"} />
                      <Row label="Road" value={`${plot.road_width_ft} ft`} />
                      <Row label="Corner" value={plot.is_corner ? "Yes" : "No"} />
                      <Row label="Rate" value={rupees(plot.price_per_sqyd)} />
                      <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-1.5">
                        <span className="text-[var(--ink)]/60">Total</span>
                        <span className="font-mono-num font-semibold">
                          {rupees(plot.price_per_sqyd * plot.size_sqyd)}
                        </span>
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
                Score reflects size, price, corner position and road width. Treat it as a starting point, not a substitute for a site visit.
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