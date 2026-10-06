import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/data/repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });
  }

  const orders = await getOrders();
  const matched = orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === query ||
      o.id.toLowerCase() === query ||
      o.customerPhone.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, ""))
  );

  if (!matched) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: matched });
}
