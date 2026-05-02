import { createAsset, listAssets } from "@/lib/blockchain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const creator = request.nextUrl.searchParams.get("creator") || undefined;
    const kindRaw = request.nextUrl.searchParams.get("kind");
    const kind = kindRaw === "crop" || kindRaw === "livestock" ? kindRaw : undefined;
    const minUnitPrice = request.nextUrl.searchParams.get("minUnitPrice") || undefined;
    const maxUnitPrice = request.nextUrl.searchParams.get("maxUnitPrice") || undefined;
    const sortRaw = request.nextUrl.searchParams.get("sort");
    const sort =
        sortRaw === "newest" ||
            sortRaw === "price-asc" ||
            sortRaw === "price-desc" ||
            sortRaw === "expected-return-desc" ||
            sortRaw === "units-available-desc"
            ? sortRaw
            : undefined;

    const assets = await listAssets({
        creator,
        kind,
        minUnitPrice,
        maxUnitPrice,
        sort,
    });

    return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const asset = await createAsset({
            creator: String(body.creator || ""),
            category: String(body.category || ""),
            kind: body.kind === "livestock" ? "livestock" : "crop",
            description: String(body.description || ""),
            identifier: String(body.identifier || ""),
            unitsTotal: String(body.unitsTotal || "0"),
            unitPrice: String(body.unitPrice || "0"),
            expectedReturnAmount: String(body.expectedReturnAmount || "0"),
            expectedReturnPeriod: String(body.expectedReturnPeriod || ""),
            metadataUri: body.metadataUri ? String(body.metadataUri) : undefined,
        });
        return NextResponse.json({ asset }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to create asset" },
            { status: 400 }
        );
    }
}
