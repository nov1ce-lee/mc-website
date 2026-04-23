import { NextResponse } from "next/server";

export async function GET() {
  const address = process.env.MC_SERVER_IP || "play.hypixel.net";
  return NextResponse.json({ address });
}
