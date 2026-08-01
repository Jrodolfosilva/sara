import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const users = await prisma.user.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { listings: true, professionals: true } },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Usuários");

  sheet.columns = [
    { header: "ID", key: "id", width: 26 },
    { header: "Nome", key: "nome", width: 28 },
    { header: "Email", key: "email", width: 30 },
    { header: "Papel", key: "role", width: 12 },
    { header: "Cadastrado em", key: "criadoEm", width: 18 },
    { header: "Empresas", key: "qtdListings", width: 10 },
    { header: "Profissionais", key: "qtdProfessionals", width: 12 },
    { header: "Status assinatura", key: "subscriptionStatus", width: 18 },
    { header: "Fim do trial", key: "trialEndsAt", width: 18 },
    { header: "Fim do período atual", key: "currentPeriodEnd", width: 20 },
    { header: "Stripe Customer ID", key: "stripeCustomerId", width: 26 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const u of users) {
    sheet.addRow({
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      criadoEm: u.criadoEm,
      qtdListings: u._count.listings,
      qtdProfessionals: u._count.professionals,
      subscriptionStatus: u.subscriptionStatus,
      trialEndsAt: u.trialEndsAt,
      currentPeriodEnd: u.currentPeriodEnd,
      stripeCustomerId: u.stripeCustomerId ?? "",
    });
  }

  for (const col of ["criadoEm", "trialEndsAt", "currentPeriodEnd"]) {
    sheet.getColumn(col).numFmt = "dd/mm/yyyy hh:mm";
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `usuarios-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
