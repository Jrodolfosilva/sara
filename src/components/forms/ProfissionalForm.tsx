"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalogData } from "@/lib/useCatalogData";
import { uploadFile } from "@/lib/uploadFile";
import type { Professional } from "@/types/catalog";

export function ProfissionalForm({
  mode,
  professionalId,
  initialData,
}: {
  mode: "create" | "edit";
  professionalId?: string;
  initialData?: Professional;
}) {
  const router = useRouter();
  const { categories, cities, carregando } = useCatalogData();

  const [categoryId, setCategoryId] = useState(initialData?.category.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategory?.id ?? "");
  const [cityId, setCityId] = useState(initialData?.city.id ?? "");
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState<string | null>(initialData?.media[0]?.url ?? null);
  const [enviandoMidia, setEnviandoMidia] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const categoriaSelecionada = categories.find((c) => c.id === categoryId);

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoMidia(true);
    try {
      setFotoPerfilUrl(await uploadFile(file));
    } catch {
      setErro("Falha ao enviar a foto.");
    } finally {
      setEnviandoMidia(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const form = new FormData(e.currentTarget);

    const payload =
      mode === "create"
        ? {
            nome: form.get("nome"),
            cpf: String(form.get("cpf") ?? "").replace(/\D/g, ""),
            dataNascimento: form.get("dataNascimento"),
            whatsapp: form.get("whatsapp"),
            categoryId,
            subcategoryId: subcategoryId || undefined,
            cityId,
            descricao: form.get("descricao"),
            bairroAtuacao: form.get("bairroAtuacao") || undefined,
            email: form.get("email") || undefined,
            instagram: form.get("instagram") || undefined,
            facebook: form.get("facebook") || undefined,
            fotoPerfilUrl: fotoPerfilUrl || undefined,
          }
        : {
            nome: form.get("nome"),
            whatsapp: form.get("whatsapp"),
            categoryId,
            subcategoryId: subcategoryId || undefined,
            cityId,
            descricao: form.get("descricao"),
            bairroAtuacao: form.get("bairroAtuacao") || undefined,
            email: form.get("email") || undefined,
            instagram: form.get("instagram") || undefined,
            facebook: form.get("facebook") || undefined,
            fotoPerfilUrl: fotoPerfilUrl || undefined,
          };

    const res = await fetch(
      mode === "create" ? "/api/v1/professionals" : `/api/v1/professionals/${professionalId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(
        data?.error === "CPF já cadastrado"
          ? "Esse CPF já está cadastrado."
          : "Não foi possível salvar o cadastro. Confira os campos obrigatórios."
      );
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
            ? "Seu cadastro entrou na fila de revisão. Assim que for aprovado, você aparece nas buscas do Busca Pebas."
            : "As alterações entraram na fila de revisão antes de voltar a aparecer na busca."}
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-2 text-2xl sm:text-3xl">
        {mode === "create" ? "Cadastrar profissional autônomo" : "Editar cadastro de profissional"}
      </h1>
      {mode === "create" && (
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          CPF e data de nascimento não aparecem no seu perfil público — usados só pra
          validação interna.
        </p>
      )}

      <form onSubmit={handleSubmit} className="surface flex flex-col gap-4 p-6 sm:p-8 mt-8">
        <Field label="Nome completo" required>
          <input name="nome" required defaultValue={initialData?.nome} className="input" />
        </Field>

        {mode === "create" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CPF" required>
              <input
                name="cpf"
                required
                placeholder="Somente números"
                inputMode="numeric"
                className="input"
              />
            </Field>
            <Field label="Data de nascimento" required>
              <input type="date" name="dataNascimento" required className="input" />
            </Field>
          </div>
        )}

        <Field label="WhatsApp" required>
          <input
            name="whatsapp"
            required
            placeholder="5594999999999"
            defaultValue={initialData?.whatsapp}
            className="input"
          />
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

        <Field label="Bairro de atuação">
          <input name="bairroAtuacao" defaultValue={initialData?.bairroAtuacao ?? undefined} className="input" />
        </Field>

        <Field label="Descrição / especialidade" required>
          <textarea
            name="descricao"
            required
            minLength={10}
            rows={4}
            defaultValue={initialData?.descricao}
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail">
            <input name="email" type="email" defaultValue={initialData?.email ?? undefined} className="input" />
          </Field>
          <Field label="Instagram">
            <input name="instagram" defaultValue={initialData?.instagram ?? undefined} className="input" />
          </Field>
          <Field label="Facebook">
            <input name="facebook" defaultValue={initialData?.facebook ?? undefined} className="input" />
          </Field>
        </div>

        <Field label="Foto de perfil">
          <input type="file" accept="image/*" onChange={handleFotoChange} />
          {fotoPerfilUrl && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-primary-cyan)" }}>
              Foto enviada.
            </p>
          )}
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
