"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalogData } from "@/lib/useCatalogData";
import { uploadFile } from "@/lib/uploadFile";
import { formatWhatsappBR, isWhatsappCompleto } from "@/lib/whatsappMask";
import { normalizeText } from "@/lib/text";
import { ProductsEditor, productsToPayload, useProductsDraft } from "@/components/forms/ProductsEditor";
import type { Listing } from "@/types/catalog";

const MAX_FOTOS = 6;

function formatCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "." + d.slice(2, 5);
  if (d.length > 5) out += "." + d.slice(5, 8);
  if (d.length > 8) out += "/" + d.slice(8, 12);
  if (d.length > 12) out += "-" + d.slice(12, 14);
  return out;
}

export function EmpresaForm({
  mode,
  listingId,
  initialData,
}: {
  mode: "create" | "edit";
  listingId?: string;
  initialData?: Listing;
}) {
  const router = useRouter();
  const { categories, cities, carregando } = useCatalogData();

  const [categoryId, setCategoryId] = useState(initialData?.category.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategory?.id ?? "");
  const [cityId, setCityId] = useState(initialData?.city.id ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData?.media.find((m) => m.tipo === "LOGO")?.url ?? null
  );
  const [fotoUrls, setFotoUrls] = useState<string[]>(
    initialData?.media.filter((m) => m.tipo === "FOTO").map((m) => m.url) ?? []
  );
  const [products, setProducts] = useProductsDraft(initialData?.products);
  const [enviandoMidia, setEnviandoMidia] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [cnpj, setCnpj] = useState(formatCnpj(initialData?.cnpj ?? ""));
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [cnpjErro, setCnpjErro] = useState<string | null>(null);
  const [atividadeCnpj, setAtividadeCnpj] = useState<string | null>(null);

  const [whatsapp, setWhatsapp] = useState(formatWhatsappBR(initialData?.whatsapp ?? ""));
  const [validandoWhatsapp, setValidandoWhatsapp] = useState(false);
  const [whatsappErro, setWhatsappErro] = useState<string | null>(null);

  const nomeRef = useRef<HTMLInputElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const categoriaSelecionada = categories.find((c) => c.id === categoryId);

  async function handleCnpjBlur() {
    const digits = cnpj.replace(/\D/g, "");
    setCnpjErro(null);
    if (digits.length !== 14) return;

    setBuscandoCnpj(true);
    try {
      const res = await fetch(`/api/v1/cnpj/${digits}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setCnpjErro(body?.error ?? "Não foi possível consultar o CNPJ.");
        return;
      }
      const data = await res.json();

      if (nomeRef.current && !nomeRef.current.value) {
        nomeRef.current.value = data.nomeFantasia || data.razaoSocial || "";
      }
      if (enderecoRef.current && !enderecoRef.current.value && data.endereco) {
        enderecoRef.current.value = data.endereco;
      }
      if (telefoneRef.current && !telefoneRef.current.value && data.telefone) {
        telefoneRef.current.value = data.telefone;
      }
      if (emailRef.current && !emailRef.current.value && data.email) {
        emailRef.current.value = data.email;
      }
      setAtividadeCnpj(data.atividadePrincipal ?? null);

      if (!cityId && data.municipio) {
        const alvo = normalizeText(data.municipio);
        const cidade = cities.find(
          (c) => normalizeText(c.nome) === alvo && (!data.uf || c.uf === data.uf)
        );
        if (cidade) setCityId(cidade.id);
      }
    } catch {
      setCnpjErro("Não foi possível consultar o CNPJ.");
    } finally {
      setBuscandoCnpj(false);
    }
  }

  function handleWhatsappChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWhatsappErro(null);
    setWhatsapp(formatWhatsappBR(e.target.value));
  }

  async function handleWhatsappBlur() {
    if (!isWhatsappCompleto(whatsapp)) return;

    setValidandoWhatsapp(true);
    setWhatsappErro(null);
    try {
      const digits = whatsapp.replace(/\D/g, "");
      const res = await fetch("/api/v1/whatsapp/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: digits }),
      });
      const data = await res.json();
      if (res.ok && !data.exists) {
        setWhatsappErro("Esse número não parece ter WhatsApp ativo.");
      } else if (!res.ok) {
        setWhatsappErro(data.error ?? "Não foi possível validar o número agora.");
      }
    } catch {
      setWhatsappErro("Não foi possível validar o número agora.");
    } finally {
      setValidandoWhatsapp(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoMidia(true);
    try {
      setLogoUrl(await uploadFile(file));
    } catch {
      setErro("Falha ao enviar o logo.");
    } finally {
      setEnviandoMidia(false);
    }
  }

  async function handleFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_FOTOS - fotoUrls.length);
    if (!files.length) return;
    setEnviandoMidia(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setFotoUrls((prev) => [...prev, ...urls]);
    } catch {
      setErro("Falha ao enviar fotos.");
    } finally {
      setEnviandoMidia(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const form = new FormData(e.currentTarget);
    const media = [
      ...(logoUrl ? [{ tipo: "LOGO" as const, url: logoUrl }] : []),
      ...fotoUrls.map((url) => ({ tipo: "FOTO" as const, url })),
    ];

    const payload = {
      nome: form.get("nome"),
      cnpj: form.get("cnpj") || undefined,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      cityId,
      descricao: form.get("descricao"),
      telefone: form.get("telefone") || undefined,
      telefoneFixo: form.get("telefoneFixo") || undefined,
      whatsapp: whatsapp.replace(/\D/g, "") || undefined,
      instagram: form.get("instagram") || undefined,
      facebook: form.get("facebook") || undefined,
      site: form.get("site") || undefined,
      email: form.get("email") || undefined,
      endereco: form.get("endereco"),
      horario: form.get("horario") || undefined,
      valorHora: form.get("valorHora") || undefined,
      aceitaPix: form.get("aceitaPix") === "on",
      aceitaCartao: form.get("aceitaCartao") === "on",
      entrega: form.get("entrega") === "on",
      atendimentoDomiciliar: form.get("atendimentoDomiciliar") === "on",
      media,
      products: productsToPayload(products),
    };

    const res = await fetch(
      mode === "create" ? "/api/v1/listings" : `/api/v1/listings/${listingId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setEnviando(false);

    if (!res.ok) {
      setErro("Não foi possível salvar o cadastro. Confira os campos obrigatórios.");
      return;
    }

    setSucesso(true);
    setTimeout(() => router.push(mode === "create" ? "/" : "/cadastro"), 2000);
  }

  if (sucesso) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl sm:text-3xl">
          {mode === "create" ? "Cadastro enviado!" : "Cadastro atualizado!"}
        </h1>
        <p className="text-[var(--color-text-muted)]">
          {mode === "create"
            ? "Seu negócio entrou na fila de revisão. Assim que for aprovado, ele aparece nas buscas do Busca Pebas."
            : "As alterações entraram na fila de revisão antes de voltar a aparecer na busca."}
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-2xl sm:text-3xl">
        {mode === "create" ? "Cadastrar empresa" : "Editar empresa"}
      </h1>

      <form onSubmit={handleSubmit} className="surface flex flex-col gap-4 p-6 sm:p-8">
        <Field label="Nome do negócio" required>
          <input
            ref={nomeRef}
            name="nome"
            required
            defaultValue={initialData?.nome}
            className="input"
          />
        </Field>

        <Field label="CNPJ">
          <input
            name="cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            onBlur={handleCnpjBlur}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            className="input"
          />
          {buscandoCnpj && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Consultando CNPJ...</p>
          )}
          {cnpjErro && <p className="mt-1 text-xs text-[var(--color-accent-coral)]">{cnpjErro}</p>}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria" required>
            <select
              required
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className="input"
              disabled={carregando}
            >
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {atividadeCnpj && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Atividade da Receita: {atividadeCnpj}
              </p>
            )}
          </Field>

          <Field label="Subcategoria">
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="input"
              disabled={!categoriaSelecionada}
            >
              <option value="">Selecione</option>
              {categoriaSelecionada?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Cidade" required>
          <select
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="input"
            disabled={carregando}
          >
            <option value="">Selecione</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descrição" required>
          <textarea
            name="descricao"
            required
            minLength={10}
            rows={4}
            defaultValue={initialData?.descricao}
            className="input"
          />
        </Field>

        <Field label="Endereço" required>
          <input
            ref={enderecoRef}
            name="endereco"
            required
            defaultValue={initialData?.endereco}
            className="input"
          />
        </Field>

        <Field label="Horário de funcionamento">
          <input
            name="horario"
            placeholder="Seg a Sex 8h-18h, Sáb 8h-12h"
            defaultValue={initialData?.horario ?? undefined}
            className="input"
          />
        </Field>

        {categoriaSelecionada?.slug === "servicos" && (
          <Field label="Valor por hora / custo médio">
            <input
              name="valorHora"
              placeholder="Ex: R$ 50/hora ou a partir de R$ 100"
              defaultValue={initialData?.valorHora ?? undefined}
              className="input"
            />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone">
            <input
              ref={telefoneRef}
              name="telefone"
              defaultValue={initialData?.telefone ?? undefined}
              className="input"
            />
          </Field>
          <Field label="Telefone fixo">
            <input
              name="telefoneFixo"
              placeholder="(94) 3346-0000"
              defaultValue={initialData?.telefoneFixo ?? undefined}
              className="input"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              name="whatsapp"
              value={whatsapp}
              onChange={handleWhatsappChange}
              onBlur={handleWhatsappBlur}
              placeholder="+55 (94) 99999-9999"
              inputMode="numeric"
              className="input"
            />
            {validandoWhatsapp && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Validando número...</p>
            )}
            {whatsappErro && (
              <p className="mt-1 text-xs text-[var(--color-accent-coral)]">{whatsappErro}</p>
            )}
          </Field>
          <Field label="Instagram">
            <input name="instagram" defaultValue={initialData?.instagram ?? undefined} className="input" />
          </Field>
          <Field label="Facebook">
            <input name="facebook" defaultValue={initialData?.facebook ?? undefined} className="input" />
          </Field>
          <Field label="Site">
            <input name="site" defaultValue={initialData?.site ?? undefined} className="input" />
          </Field>
          <Field label="E-mail">
            <input
              ref={emailRef}
              name="email"
              type="email"
              defaultValue={initialData?.email ?? undefined}
              className="input"
            />
          </Field>
        </div>

        <fieldset className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aceitaPix" defaultChecked={initialData?.aceitaPix} /> Aceita PIX
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aceitaCartao" defaultChecked={initialData?.aceitaCartao} /> Aceita cartão
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="entrega" defaultChecked={initialData?.entrega} /> Faz entrega
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="atendimentoDomiciliar"
              defaultChecked={initialData?.atendimentoDomiciliar}
            />{" "}
            Atendimento domiciliar
          </label>
        </fieldset>

        <Field label="Logo">
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoUrl && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
              Logo enviado.
            </p>
          )}
        </Field>

        <Field label={`Galeria de fotos (até ${MAX_FOTOS}) — ${fotoUrls.length}/${MAX_FOTOS}`}>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={fotoUrls.length >= MAX_FOTOS}
            onChange={handleFotosChange}
          />
        </Field>

        <ProductsEditor products={products} onChange={setProducts} />

        {erro && <p className="text-sm text-[var(--color-accent-coral)]">{erro}</p>}

        <button type="submit" disabled={enviando || enviandoMidia} className="btn btn-accent">
          {enviando ? "Salvando..." : mode === "create" ? "Enviar cadastro" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">
        {label} {required && <span style={{ color: "var(--color-accent-coral)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
