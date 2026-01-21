export const runtime = "nodejs";
export const maxDuration = 30;

import { NextRequest } from "next/server";

// Services
import { exportInvoiceService } from "@/services/invoice/server/exportInvoiceService";

export async function POST(req: NextRequest) {
    const result = await exportInvoiceService(req);
    return result;
}
