 "use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ChatWidget from "./ChatWidget";

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

const colors = {
  available: "bg-green-500 text-white",
  sold: "bg-red-500 text-white",
  held: "bg-amber-400 text-black",
};

const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// Simple, explainable scoring: bigger size, lower price, corner plot,
// and wider road all count in the plot's favor.
function scorePlot(p: Plot, minPrice: number, maxSize: number) {
  let score = 0;
  score += (p.size_sqyd / maxSize) * 40; // up to 40 points for size
  score += (minPrice / p.price_per_sqyd) * 40; // up to 40 points for lower price
  score += p.is_corner ? 10 : 0;
  score += (p.road_width_ft / 40) * 10; // up to 10 points for road width
  return Math.round(score);
}

export default function Home() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selected, setSelected] = useState<Plot | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
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
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Sy No 18 Layout - Indrakaran</h1>
      <p className="mb-3 text-gray-600">
        Click a plot for details, or tick the checkbox to compare it with others
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <span><b className="text-green-600">●</b> Available</span>
        <span><b className="text-red-500">●</b> Sold</span>
        <span><b className="text-amber-500">●</b> Held</span>
        {compareIds.length > 0 && (
          <button
            onClick={() => setShowCompare(true)}
            disabled={compareIds.length < 2}
            className="rounded bg-blue-600 px-3 py-1 font-semibold text-white disabled:bg-gray-300"
          >
            Compare {compareIds.length} plot{compareIds.length > 1 ? "s" : ""}
          </button>
        )}
        {compareIds.length > 0 && (
          <button
            onClick={() => setCompareIds([])}
            className="text-gray-500 underline"
          >
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative w-full max-w-xl">
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
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow ${
                  colors[p.status]
                } ${selected?.id === p.id ? "ring-4 ring-blue-500" : ""}`}
              >
                {p.plot_number}
              </button>
              <input
                type="checkbox"
                checked={compareIds.includes(p.id)}
                onChange={() => toggleCompare(p.id)}
                className="absolute -right-2 -top-2 h-3.5 w-3.5"
                title={`Add plot ${p.plot_number} to compare`}
              />
            </div>
          ))}
        </div>

        <div className="md:sticky md:top-6 md:w-72 md:self-start">
          {selected ? (
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-bold">
                Plot {selected.plot_number}{" "}
                <span className="text-sm font-normal capitalize">
                  ({selected.status})
                </span>
              </h2>
              <ul className="mt-2 space-y-1">
                <li>Size: {selected.size_sqyd} sq yd</li>
                <li>Facing: {selected.facing ?? "Not available"}</li>
                <li>Road width: {selected.road_width_ft} ft</li>
                <li>Corner plot: {selected.is_corner ? "Yes" : "No"}</li>
                <li>Price: {rupees(selected.price_per_sqyd)} per sq yd</li>
                <li className="font-bold">
                  Total: {rupees(selected.price_per_sqyd * selected.size_sqyd)}
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">Select a plot on the map</p>
          )}
        </div>
      </div>

      {showCompare && compareList.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Plot comparison</h2>
              <button
                onClick={() => setShowCompare(false)}
                className="text-sm text-gray-500 underline"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {scored.map(({ plot, score }) => (
                <div key={plot.id} className="rounded border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Plot {plot.plot_number}</h3>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${colors[plot.status]}`}
                    >
                      {plot.status}
                    </span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>Score: {score}</li>
                    <li>Size: {plot.size_sqyd} sq yd</li>
                    <li>Facing: {plot.facing ?? "Not available"}</li>
                    <li>Road width: {plot.road_width_ft} ft</li>
                    <li>Corner: {plot.is_corner ? "Yes" : "No"}</li>
                    <li>Price: {rupees(plot.price_per_sqyd)} / sq yd</li>
                    <li className="font-semibold">
                      Total: {rupees(plot.price_per_sqyd * plot.size_sqyd)}
                    </li>
                  </ul>
                  {plot.id === bestId && (
                    <div className="mt-2 text-sm font-semibold text-green-700">
                      Best value based on size, price, corner and road width.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ChatWidget />
    </main>
  );
}