import { distributeProfit } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    context: { params: { assetId: string } }
) {
    try {
        const body = await request.json();
        const distribution = await distributeProfit({
            assetId: context.params.assetId,
            operator: String(body.operator || ""),
            totalAmount: String(body.totalAmount || "0"),
        });
        return NextResponse.json({ distribution }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to distribute profits" },
            { status: 400 }
        );
    }
}
