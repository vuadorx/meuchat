import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/lib/instagram";
import { supabase } from "@/lib/supabase";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN!;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256") || "";
  const body = await request.text();

  if (!validateWebhookSignature(body, signature, APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const event = JSON.parse(body);
  await supabase.from("events").insert({
    event_type: event.entry?.[0]?.changes?.[0]?.field || "unknown",
    event_data: event,
    processed: false,
  });

  return NextResponse.json({ status: "ok" });
}