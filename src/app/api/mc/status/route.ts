import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const ip = process.env.MC_SERVER_IP || "play.hypixel.net";
  
  try {
    const response = await axios.get(`https://api.mcstatus.io/v2/status/java/${ip}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Failed to fetch MC status:", error);
    return NextResponse.json({ online: false, players: { online: 0, max: 0 } }, { status: 500 });
  }
}
