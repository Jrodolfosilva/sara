"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalogData } from "@/lib/useCatalogData";
import { uploadFile } from "@/lib/uploadFile";
import type { Listing } from "@/types/catalog";

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
  const [enviandoMidia, setEnviandoMidia] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const categoriaSelecionada = categories.find((c) => c.id === categoryId);

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
    const files = Array.from(e.target.files ?? []).slice(0, 8 - fotoUrls.length);
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
      categoryId,
      subcategoryId: subcategoryId || undefined,
      cityId,
      descricao: form.get("descricao"),
      telefone: form.get("telefone") || undefined,
      whatsapp: form.get("whatsapp") || undefined,
      instagram: form.get("instagram") || undefined,
      facebook: form.get("facebook") || undefined,
      site: form.get("site") || undefined,
      email: form.get("email") || undefined,
      endereco: form.get("endereco"),
      horario: form.get("horario") || undefined,
      aceitaPix: form.get("aceitaPix") === "on",
      aceitaCartao: form.get("aceitaCartao") === "on",
      entrega: form.get("entrega") === "on",
      atendimentoDomiciliar: form.get("atendimentoDomiciliar") === "on",
      media,
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
          <input name="nome" required defaultValue={initialData?.nome} className="input" />
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
          <input name="endereco" required defaultValue={initialData?.endereco} className="input" />
        </Field>

        <Field label="Horário de funcionamento">
          <input
            name="horario"
            placeholder="Seg a Sex 8h-18h, Sáb 8h-12h"
            defaultValue={initialData?.horario ?? undefined}
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone">
            <input name="telefone" defaultValue={initialData?.telefone ?? undefined} className="input" />
          </Field>
          <Field label="WhatsApp">
            <input
              name="whatsapp"
              placeholder="5594999999999"
              defaultValue={initialData?.whatsapp ?? undefined}
              className="input"
            />
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
            <input name="email" type="email" defaultValue={initialData?.email ?? undefined} className="input" />
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

        <Field label={`Fotos (até 8) — ${fotoUrls.length}/8`}>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={fotoUrls.length >= 8}
            onChange={handleFotosChange}
          />
        </Field>

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
