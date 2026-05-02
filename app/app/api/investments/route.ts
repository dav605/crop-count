import { listInvestments } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const investor = request.nextUrl.searchParams.get("investor") || undefined;
    const investments = await listInvestments({ investor });
    return NextResponse.json({ investments });
}
