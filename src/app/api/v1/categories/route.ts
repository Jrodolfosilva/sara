import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { nome: "asc" },
    include: {
      subcategories: { orderBy: { nome: "asc" } },
    },
  });
  return NextResponse.json(categories);
}
