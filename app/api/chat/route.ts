import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const { data: plots } = await supabase
    .from("plots")
    .select("*")
    .order("plot_number");

  const { data: villas } = await supabase
    .from("villas")
    .select("*")
    .order("villa_number");

  const plotSummary = (plots ?? [])
    .map(
      (p) =>
        `Plot ${p.plot_number}: ${p.size_sqyd} sq yd, facing ${
          p.facing ?? "unknown"
        }, road ${p.road_width_ft} ft, ${
          p.is_corner ? "corner plot" : "not corner"
        }, price ₹${p.price_per_sqyd}/sq yd, status ${p.status}`
    )
    .join("\n");

  const villaSummary = (villas ?? [])
    .map(
      (v) =>
        `Villa ${v.villa_number}: ${v.bhk} BHK, ${v.size_sqft} sq ft, facing ${
          v.facing ?? "unknown"
        }, price ₹${v.price} (${(v.price / 10000000).toFixed(2)} Cr), status ${v.status}`
    )
    .join("\n");

  const systemPrompt = `You are a helpful assistant for Praneeta Developers. We have two projects:

1. Sy No 18 Layout, Indrakaran village - open residential plots.
2. Santorini Villas, Mokila - a 126-villa gated community (4, 5 and 6 BHK), arranged in rows that alternate facing east and west.

Only use the data below to answer. If asked something it doesn't cover, say you don't have that information and suggest contacting the sales team.
Never claim a company is "100% legal" or guarantee outcomes - only describe what documents or facts are available.
Recommend a plot or villa based on the customer's stated needs (budget, size, BHK, facing). Keep answers short and clear.

Plot data (Sy No 18):
${plotSummary}

Villa data (Santorini Villas):
${villaSummary}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json({ error: errText }, { status: 500 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that.";
  return NextResponse.json({ reply });
}