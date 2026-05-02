import { investInAsset } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    context: { params: { assetId: string } }
) {
    try {
        const body = await request.json();
        const investment = await investInAsset({
            assetId: context.params.assetId,
            investor: String(body.investor || ""),
            units: String(body.units || "0"),
        });
        return NextResponse.json({ investment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to invest" },
            { status: 400 }
        );
    }
}
