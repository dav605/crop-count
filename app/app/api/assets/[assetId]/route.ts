import { listAssets } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    context: { params: { assetId: string } }
) {
    const assets = await listAssets();
    const asset = assets.find((item) => item.assetId === context.params.assetId);

    if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
}
