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

  const systemPrompt = `You are a helpful assistant for "Sy No 18 Layout" in Indrakaran village, a plot layout project.
Only use the plot data below to answer. If asked something the data doesn't cover, say you don't have that information and suggest contacting the sales team.
Never claim a company is "100% legal" or guarantee outcomes - only describe what documents or facts are available.
Recommend plots based on the customer's stated needs (budget, size, facing). Keep answers short and clear.

Plot data:
${plotSummary}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "Failed to generate response", details: errorText },
      { status: 500 }
    );
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

  return NextResponse.json({ reply: answer });
}
