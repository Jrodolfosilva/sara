import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function whatsappLink(numero: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}`;
}

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, status: "APROVADO" },
    include: { category: true, subcategory: true, city: true, media: { orderBy: { ordem: "asc" } } },
  });

  if (!listing) notFound();

  const logo = listing.media.find((m) => m.tipo === "LOGO");
  const fotos = listing.media.filter((m) => m.tipo === "FOTO");

  return (
    <div className="container py-12">
      <div className="mb-6 flex items-center gap-4">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.url}
            alt={listing.nome}
            className="h-20 w-20 rounded-2xl object-cover shadow-[var(--shadow-sm)]"
          />
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl">{listing.nome}</h1>
          <p className="text-sm font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
            {listing.category.nome}
            {listing.subcategory ? ` · ${listing.subcategory.nome}` : ""} · {listing.city.nome}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{listing.codigoPublico}</p>
        </div>
      </div>

      <p className="mb-6 whitespace-pre-line text-[var(--color-text-main)]">{listing.descricao}</p>

      {fotos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {fotos.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f.id} src={f.url} alt="" className="aspect-square rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm sm:grid-cols-2">
        <Info label="Endereço" value={listing.endereco} />
        <Info label="Horário" value={listing.horario} />
        <Info label="Telefone" value={listing.telefone} />
        <Info label="E-mail" value={listing.email} />
        <Info label="Instagram" value={listing.instagram} />
        <Info label="Facebook" value={listing.facebook} />
        <Info label="Site" value={listing.site} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2 text-xs">
        {listing.aceitaPix && <Badge>Aceita PIX</Badge>}
        {listing.aceitaCartao && <Badge>Aceita cartão</Badge>}
        {listing.entrega && <Badge>Faz entrega</Badge>}
        {listing.atendimentoDomiciliar && <Badge>Atendimento domiciliar</Badge>}
      </div>

      {listing.whatsapp && (
        <a href={whatsappLink(listing.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
          Chamar no WhatsApp
        </a>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <p className="text-[var(--color-text-main)]">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="pill" style={{ background: "var(--color-bg-light)", color: "var(--color-primary-dark)", border: "none" }}>{children}</span>;
}
