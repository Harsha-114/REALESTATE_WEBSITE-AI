import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: plots } = await supabase.from("plots").select("*").order("plot_number");
  const { data: slots } = await supabase
    .from("time_slots")
    .select("*")
    .order("slot_date")
    .order("slot_time");

  return NextResponse.json({ plots, slots });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "update_plot_status") {
    await supabase.from("plots").update({ status: body.status }).eq("id", body.plotId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "add_slot") {
    await supabase.from("time_slots").insert({
      slot_date: body.slotDate,
      slot_time: body.slotTime,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete_slot") {
    await supabase.from("time_slots").delete().eq("id", body.slotId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}