import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, phone, interestSummary, plotNumbers } = await req.json();

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  await supabase.from("leads").insert({
    name,
    phone,
    interest_summary: interestSummary ?? null,
    plot_numbers: plotNumbers ?? [],
  });

  const text = `🔔 New lead: ${name}
📞 ${phone}
Interested in: ${interestSummary || "General enquiry"}
Plots viewed: ${plotNumbers?.length ? plotNumbers.join(", ") : "None specified"}`;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  }

  return NextResponse.json({ ok: true });
}