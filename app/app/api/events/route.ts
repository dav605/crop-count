import { listEvents } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const limitRaw = request.nextUrl.searchParams.get("limit") || "100";
    const limit = Number(limitRaw);
    const events = await listEvents(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json(events);
}
