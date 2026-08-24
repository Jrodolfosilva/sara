import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { AssinaturaError, criarCheckoutNegocio } from "@/lib/subscriptionCheckout";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  try {
    const url = await criarCheckoutNegocio({ tipo: "professional", id, origin: request.nextUrl.origin });
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof AssinaturaError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
