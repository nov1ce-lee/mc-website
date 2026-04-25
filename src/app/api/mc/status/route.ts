import { NextResponse } from "next/server";

export async function GET() {
  const ip = process.env.MC_SERVER_IP || "play.hypixel.net";
  
  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${ip}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`mcstatus responded with ${response.status}`);
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Failed to fetch MC status:", error);
    return NextResponse.json({ online: false, players: { online: 0, max: 0 } }, { status: 500 });
  }
}
