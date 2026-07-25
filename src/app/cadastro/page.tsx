import Link from "next/link";
import { Building2, HardHat } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<string, string> = {
  PENDENTE: "Em análise",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  INATIVO: "Inativo",
};

export default async function CadastroPage() {
  const session = await auth();

  let meusCadastros: { id: string; nome: string; status: string; tipo: "empresa" | "profissional" }[] = [];

  if (session?.user) {
    const [listings, professionals] = await Promise.all([
      prisma.listing.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, nome: true, status: true },
      }),
      prisma.professional.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, nome: true, status: true },
      }),
    ]);

    meusCadastros = [
      ...listings.map((l) => ({ ...l, tipo: "empresa" as const })),
      ...professionals.map((p) => ({ ...p, tipo: "profissional" as const })),
    ];
  }

  return (
    <div className="container py-14">
      {meusCadastros.length > 0 && (
        <>
          <h1 className="mb-2 text-2xl sm:text-3xl">Seus cadastros</h1>
          <p className="mb-8 text-[var(--color-text-muted)]">
            Edite os dados do seu negócio ou perfil abaixo.
          </p>

          <div className="mb-12 flex flex-col gap-3">
            {meusCadastros.map((c) => (
              <Link
                key={`${c.tipo}-${c.id}`}
                href={`/cadastro/${c.tipo}/${c.id}/editar`}
                className="card flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.tipo === "empresa" ? "Empresa / Comércio" : "Profissional autônomo"}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: "var(--color-primary-cyan)" }}
                >
                  {statusLabel[c.status] ?? c.status}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-2 text-xl sm:text-2xl">
        {meusCadastros.length > 0 ? "Cadastrar outro negócio" : "Cadastre-se no Busca Pebas"}
      </h2>
      <p className="mb-10 text-[var(--color-text-muted)]">
        Escolha o tipo de cadastro. Depois de enviado, seu cadastro passa por uma
        revisão rápida antes de aparecer na busca.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/cadastro/empresa" className="card p-6">
          <div className="cadastro-tipo-icon">
            <Building2 size={24} />
          </div>
          <h2 className="mb-2 text-lg">Empresa / Comércio</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Loja, restaurante, clínica, ponto turístico e outros negócios com endereço.
          </p>
        </Link>

        <Link href="/cadastro/profissional" className="card p-6">
          <div className="cadastro-tipo-icon">
            <HardHat size={24} />
          </div>
          <h2 className="mb-2 text-lg">Profissional autônomo</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Encanador, eletricista, pintor e outros prestadores de serviço avulsos.
          </p>
        </Link>
      </div>
    </div>
  );
}
