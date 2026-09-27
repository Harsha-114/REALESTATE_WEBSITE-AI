import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("is_booked", false)
    .order("slot_date")
    .order("slot_time");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

export async function POST(req: NextRequest) {
  const { slotId, name, phone } = await req.json();

  if (!slotId || !name || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: slot } = await supabase
    .from("time_slots")
    .select("*")
    .eq("id", slotId)
    .eq("is_booked", false)
    .single();

  if (!slot) {
    return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
  }

  await supabase.from("time_slots").update({ is_booked: true }).eq("id", slotId);
  await supabase.from("bookings").insert({ slot_id: slotId, name, phone });

  const text = `📅 New appointment booked
👤 ${name}
📞 ${phone}
🗓️ ${slot.slot_date} at ${slot.slot_time}`;

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