import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit, respostaLimitada } from "@/lib/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const limite = rateLimit(`cnpj:${getClientIp(request)}`, 20, 60 * 60 * 1000);
  if (!limite.permitido) return respostaLimitada(limite.retryAfterSegundos);

  const { cnpj: raw } = await params;
  const cnpj = raw.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  const upstream = await fetch(`https://api.opencnpj.org/${cnpj}`, {
    headers: { Accept: "application/json" },
  });

  if (upstream.status === 404) {
    return NextResponse.json({ error: "CNPJ não encontrado" }, { status: 404 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "Falha ao consultar CNPJ" }, { status: 502 });
  }

  const data = await upstream.json();

  const endereco = [
    [data.tipo_logradouro, data.logradouro].filter(Boolean).join(" "),
    data.numero,
    data.complemento,
    data.bairro,
    data.municipio && data.uf ? `${data.municipio}/${data.uf}` : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  const telefone = data.telefones?.find((t: { is_fax?: boolean }) => !t.is_fax);
  const atividadePrincipal = data.cnaes?.find((c: { is_principal?: boolean }) => c.is_principal);

  return NextResponse.json({
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    situacaoCadastral: data.situacao_cadastral ?? "",
    endereco,
    municipio: data.municipio || undefined,
    uf: data.uf || undefined,
    atividadePrincipal: atividadePrincipal?.descricao || undefined,
    email: data.email || undefined,
    telefone: telefone ? `${telefone.ddd}${telefone.numero}` : undefined,
  });
}
