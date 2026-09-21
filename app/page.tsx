 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function Home() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selected, setSelected] = useState<Plot | null>(null);
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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Sy No 18 Layout - Indrakaran</h1>
      <p className="mb-3 text-gray-600">Click a plot number to see its details</p>

      <div className="mb-4 flex gap-4 text-sm">
        <span><b className="text-green-600">●</b> Available</span>
        <span><b className="text-red-500">●</b> Sold</span>
        <span><b className="text-amber-500">●</b> Held</span>
      </div>

      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative w-full max-w-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/layout.jpg" alt="Layout map" className="w-full" />
          {plots.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                left: `${(p.map_x / IMG_W) * 100}%`,
                top: `${(p.map_y / IMG_H) * 100}%`,
              }}
              className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold shadow ${
                colors[p.status]
              } ${selected?.id === p.id ? "ring-4 ring-blue-500" : ""}`}
            >
              {p.plot_number}
            </button>
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
    </main>
  );
}