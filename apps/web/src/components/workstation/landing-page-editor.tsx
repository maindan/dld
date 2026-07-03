"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Download, ImageIcon, Plus, X, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  SECAO_BLOCKS,
  defaultCampos,
  defaultItem,
  novoNavItem,
  type Secao,
  type HeaderConfig,
  type FooterConfig,
  type WhatsappConfig,
  type NavItem,
  type RedeSocial,
  type CampoDef,
} from "@danlimadev/contracts";
import { LANDING_PAGE_MODELS, type LandingPageTheme } from "@danlimadev/landing-generator/models";
import { updateLandingPageAction, uploadLandingPageLogoAction } from "@/lib/actions/landing-pages";
import type { LandingPageDetail } from "@/lib/queries/landing-pages";
import { secaoLabel } from "@/lib/landing-pages/secao-label";
import { LandingPagePreview, type PreviewSelecao } from "@/components/workstation/lp-preview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CORES_DESTAQUE = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"];

type Painel = "header" | "secoes" | "footer" | "whatsapp";

function useDebouncedSave(save: () => void, delayMs = 700) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, delayMs);
  }, [save, delayMs]);
}

export function LandingPageEditor({ landingPage }: { landingPage: LandingPageDetail }) {
  const tema: LandingPageTheme = useMemo(
    () => LANDING_PAGE_MODELS.find((m) => m.id === landingPage.modeloId) ?? LANDING_PAGE_MODELS[0],
    [landingPage.modeloId],
  );

  const [corAcento, setCorAcento] = useState(landingPage.corAcento);
  const [header, setHeader] = useState<HeaderConfig>(landingPage.header);
  const [secoes, setSecoes] = useState<Secao[]>(landingPage.secoes);
  const [footer, setFooter] = useState<FooterConfig>(landingPage.footer);
  const [whatsapp, setWhatsapp] = useState<WhatsappConfig>(landingPage.whatsapp);

  const [painel, setPainel] = useState<Painel>("secoes");
  const [selecionado, setSelecionado] = useState<PreviewSelecao | null>(
    landingPage.secoes[0] ? { tipo: "secao", id: landingPage.secoes[0].id } : null,
  );
  const [addSecaoOpen, setAddSecaoOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [gerado, setGerado] = useState<{ nome: string; blob: Blob } | null>(null);

  const persist = useDebouncedSave(() => {
    void updateLandingPageAction(landingPage.id, { corAcento, header, secoes, footer, whatsapp });
  });

  useEffect(() => {
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corAcento, header, secoes, footer, whatsapp]);

  function selecionar(sel: PreviewSelecao) {
    setSelecionado(sel);
    setPainel(sel.tipo === "secao" ? "secoes" : sel.tipo === "header" ? "header" : sel.tipo === "footer" ? "footer" : "secoes");
  }

  async function trocarLogo(file: File) {
    setUploadingLogo(true);
    try {
      const url = await uploadLandingPageLogoAction(landingPage.id, file, header.logoUrl);
      setHeader((h) => ({ ...h, logoUrl: url }));
    } finally {
      setUploadingLogo(false);
    }
  }

  function addSecao(tipo: string) {
    const nova: Secao = {
      id: crypto.randomUUID(),
      tipo,
      campos: defaultCampos(tipo),
      itens: SECAO_BLOCKS[tipo]?.itens ? [{ id: crypto.randomUUID(), campos: defaultItem(tipo) }] : undefined,
    };
    setSecoes((atual) => [...atual, nova]);
    setSelecionado({ tipo: "secao", id: nova.id });
    setPainel("secoes");
    setAddSecaoOpen(false);
  }

  function removerSecao(id: string) {
    setSecoes((atual) => atual.filter((s) => s.id !== id));
    setHeader((h) => ({ ...h, navItems: h.navItems.map((n) => (n.secaoId === id ? { ...n, secaoId: "topo" } : n)) }));
    setSelecionado((sel) => (sel?.tipo === "secao" && sel.id === id ? null : sel));
  }

  function moverSecao(id: string, dir: -1 | 1) {
    setSecoes((atual) => {
      const idx = atual.findIndex((s) => s.id === id);
      const alvo = idx + dir;
      if (idx === -1 || alvo < 0 || alvo >= atual.length) return atual;
      const copia = [...atual];
      [copia[idx], copia[alvo]] = [copia[alvo], copia[idx]];
      return copia;
    });
  }

  function atualizarCampo(secaoId: string, chave: string, valor: string) {
    setSecoes((atual) => atual.map((s) => (s.id === secaoId ? { ...s, campos: { ...s.campos, [chave]: valor } } : s)));
  }

  function adicionarItem(secaoId: string) {
    setSecoes((atual) =>
      atual.map((s) => {
        if (s.id !== secaoId) return s;
        const def = SECAO_BLOCKS[s.tipo]?.itens;
        const atuais = s.itens ?? [];
        if (!def || atuais.length >= def.max) return s;
        return { ...s, itens: [...atuais, { id: crypto.randomUUID(), campos: defaultItem(s.tipo) }] };
      }),
    );
  }

  function removerItem(secaoId: string, itemId: string) {
    setSecoes((atual) =>
      atual.map((s) => {
        if (s.id !== secaoId) return s;
        const def = SECAO_BLOCKS[s.tipo]?.itens;
        const atuais = s.itens ?? [];
        if (!def || atuais.length <= def.min) return s;
        return { ...s, itens: atuais.filter((it) => it.id !== itemId) };
      }),
    );
  }

  function atualizarItem(secaoId: string, itemId: string, chave: string, valor: string) {
    setSecoes((atual) =>
      atual.map((s) =>
        s.id !== secaoId
          ? s
          : { ...s, itens: s.itens?.map((it) => (it.id === itemId ? { ...it, campos: { ...it.campos, [chave]: valor } } : it)) },
      ),
    );
  }

  function adicionarNavItem() {
    setHeader((h) => ({ ...h, navItems: [...h.navItems, novoNavItem("Novo link", secoes[0]?.id ?? "topo")] }));
  }
  function atualizarNavItem(id: string, patch: Partial<NavItem>) {
    setHeader((h) => ({ ...h, navItems: h.navItems.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));
  }
  function removerNavItem(id: string) {
    setHeader((h) => ({ ...h, navItems: h.navItems.filter((n) => n.id !== id) }));
  }

  function adicionarRedeSocial() {
    setFooter((f) => ({ ...f, redesSociais: [...f.redesSociais, { id: crypto.randomUUID(), rede: "", url: "" }] }));
  }
  function atualizarRedeSocial(id: string, patch: Partial<RedeSocial>) {
    setFooter((f) => ({ ...f, redesSociais: f.redesSociais.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }
  function removerRedeSocial(id: string) {
    setFooter((f) => ({ ...f, redesSociais: f.redesSociais.filter((r) => r.id !== id) }));
  }

  async function gerarProjeto() {
    setGerando(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPage.id}/gerar`);
      if (!res.ok) throw new Error("Falha ao gerar projeto");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const nome = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "landing-page.zip";
      setGerado({ nome, blob });
    } finally {
      setGerando(false);
    }
  }

  function baixarZip() {
    if (!gerado) return;
    const url = URL.createObjectURL(gerado.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = gerado.nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  const secaoSelecionada = useMemo(
    () => (selecionado?.tipo === "secao" ? (secoes.find((s) => s.id === selecionado.id) ?? null) : null),
    [secoes, selecionado],
  );

  return (
    <div className="flex h-full flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/workstation"
          className="flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-muted-foreground hover:border-[#3a4553] hover:text-foreground"
        >
          <ChevronLeft size={14} /> Modelos
        </Link>
        <div className="text-[13px] text-muted-foreground">
          Modelo <span className="font-semibold text-foreground">{landingPage.modeloNome}</span>
        </div>
        <div className="flex-1" />
        {!gerado ? (
          <button
            onClick={gerarProjeto}
            disabled={gerando}
            className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Download size={14} /> {gerando ? "Gerando…" : "Gerar projeto Next.js"}
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-[9px] border border-success/35 bg-success/10 px-3 py-1.5">
            <Check size={15} className="text-success" />
            <span className="font-mono text-[11.5px] text-success">{gerado.nome}</span>
            <button
              onClick={baixarZip}
              className="rounded-[7px] bg-success px-2.5 py-1 text-[11.5px] font-semibold text-background"
            >
              Baixar
            </button>
            <button onClick={() => setGerado(null)} className="text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr] gap-3.5">
        {/* LEFT: editor */}
        <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-card">
          <div className="flex items-center gap-1 border-b border-border p-2">
            {(["header", "secoes", "footer", "whatsapp"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPainel(p)}
                className="flex-1 rounded-[7px] px-2 py-1.5 text-[12px] font-medium"
                style={{
                  background: painel === p ? "rgba(129,140,248,0.12)" : "transparent",
                  color: painel === p ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {p === "secoes" ? "Seções" : p === "header" ? "Header" : p === "footer" ? "Footer" : "WhatsApp"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {painel === "header" && (
              <HeaderPanel
                header={header}
                secoes={secoes}
                corAcento={corAcento}
                uploadingLogo={uploadingLogo}
                onToggleLogo={(v) => setHeader((h) => ({ ...h, mostrarLogo: v }))}
                onToggleTitulo={(v) => setHeader((h) => ({ ...h, mostrarTitulo: v }))}
                onTituloChange={(v) => setHeader((h) => ({ ...h, titulo: v }))}
                onCorChange={setCorAcento}
                onTrocarLogo={trocarLogo}
                onAddNav={adicionarNavItem}
                onUpdateNav={atualizarNavItem}
                onRemoveNav={removerNavItem}
              />
            )}

            {painel === "secoes" && (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  {secoes.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1 rounded-[8px] px-1.5 py-1"
                      style={{ background: secaoSelecionada?.id === s.id ? "rgba(129,140,248,0.1)" : "transparent" }}
                    >
                      <button
                        onClick={() => setSelecionado({ tipo: "secao", id: s.id })}
                        className="flex flex-1 items-center gap-2 rounded-[6px] px-1.5 py-1 text-left text-[12.5px]"
                        style={{ color: secaoSelecionada?.id === s.id ? "var(--foreground)" : "var(--muted-foreground)" }}
                      >
                        <span className="size-2 flex-none rounded-[3px]" style={{ background: corAcento }} />
                        {secaoLabel(secoes, s)}
                      </button>
                      <button
                        onClick={() => moverSecao(s.id, -1)}
                        disabled={i === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => moverSecao(s.id, 1)}
                        disabled={i === secoes.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button onClick={() => removerSecao(s.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {secoes.length === 0 && (
                    <div className="py-3 text-center text-[12px] text-muted-foreground">Nenhuma seção ainda.</div>
                  )}
                </div>

                {secaoSelecionada && (
                  <SecaoEditor
                    secao={secaoSelecionada}
                    onCampoChange={(chave, valor) => atualizarCampo(secaoSelecionada.id, chave, valor)}
                    onItemChange={(itemId, chave, valor) => atualizarItem(secaoSelecionada.id, itemId, chave, valor)}
                    onAddItem={() => adicionarItem(secaoSelecionada.id)}
                    onRemoveItem={(itemId) => removerItem(secaoSelecionada.id, itemId)}
                  />
                )}
              </div>
            )}

            {painel === "footer" && (
              <FooterPanel
                footer={footer}
                onChange={(patch) => setFooter((f) => ({ ...f, ...patch }))}
                onAddRede={adicionarRedeSocial}
                onUpdateRede={atualizarRedeSocial}
                onRemoveRede={removerRedeSocial}
              />
            )}

            {painel === "whatsapp" && (
              <WhatsappPanel whatsapp={whatsapp} onChange={(patch) => setWhatsapp((w) => ({ ...w, ...patch }))} />
            )}
          </div>

          {painel === "secoes" && (
            <div className="border-t border-border p-3">
              <button
                onClick={() => setAddSecaoOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-[9px] bg-[#222b36] py-2.5 text-[12.5px] font-semibold text-foreground hover:bg-[#2a3441]"
              >
                <Plus size={14} /> Adicionar seção
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: live preview */}
        <div className="flex flex-col overflow-hidden rounded-[14px] border border-border bg-[#0b0e13]">
          <div className="flex items-center gap-2 border-b border-border bg-[#11151c] px-3.5 py-2">
            <div className="flex gap-1.5">
              <span className="size-[9px] rounded-full bg-[#ff5f57]" />
              <span className="size-[9px] rounded-full bg-[#febc2e]" />
              <span className="size-[9px] rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center font-mono text-[10.5px] text-muted-foreground">
              preview · clique numa seção para editar
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <LandingPagePreview
              tema={tema}
              corAcento={corAcento}
              header={header}
              secoes={secoes}
              footer={footer}
              whatsapp={whatsapp}
              selecionado={selecionado}
              onSelect={selecionar}
            />
          </div>
        </div>
      </div>

      <AddSecaoDialog open={addSecaoOpen} onOpenChange={setAddSecaoOpen} onPick={addSecao} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header panel
// ---------------------------------------------------------------------------

function HeaderPanel({
  header,
  secoes,
  corAcento,
  uploadingLogo,
  onToggleLogo,
  onToggleTitulo,
  onTituloChange,
  onCorChange,
  onTrocarLogo,
  onAddNav,
  onUpdateNav,
  onRemoveNav,
}: {
  header: HeaderConfig;
  secoes: Secao[];
  corAcento: string;
  uploadingLogo: boolean;
  onToggleLogo: (v: boolean) => void;
  onToggleTitulo: (v: boolean) => void;
  onTituloChange: (v: string) => void;
  onCorChange: (v: string) => void;
  onTrocarLogo: (file: File) => void;
  onAddNav: () => void;
  onUpdateNav: (id: string, patch: Partial<NavItem>) => void;
  onRemoveNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <Field label="">
        <label className="flex items-center gap-2 text-[12.5px] text-foreground">
          <input
            type="checkbox"
            checked={header.mostrarLogo}
            onChange={(e) => onToggleLogo(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Mostrar logo
        </label>
      </Field>

      {header.mostrarLogo && (
        <Field label="Logo">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] border border-dashed border-[#3a4553] px-3 py-2.5 text-muted-foreground hover:border-primary hover:text-foreground">
            <ImageIcon size={16} />
            <span className="text-[11.5px]">
              {uploadingLogo ? "Enviando…" : header.logoUrl ? "Trocar logo" : "arraste um SVG/PNG"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingLogo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onTrocarLogo(file);
              }}
            />
          </label>
          {header.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={header.logoUrl} alt="Logo" className="mt-2 h-8 w-auto rounded-[4px] bg-white/5 p-1" />
          )}
        </Field>
      )}

      <Field label="">
        <label className="flex items-center gap-2 text-[12.5px] text-foreground">
          <input
            type="checkbox"
            checked={header.mostrarTitulo}
            onChange={(e) => onToggleTitulo(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Mostrar título
        </label>
      </Field>

      {header.mostrarTitulo && (
        <Field label="Título / nome da marca">
          <Input value={header.titulo} onChange={(e) => onTituloChange(e.target.value)} placeholder="Ex.: Clínica Vitalle" />
        </Field>
      )}

      <Field label="Cor de destaque">
        <div className="flex gap-2">
          {CORES_DESTAQUE.map((cor) => (
            <button
              key={cor}
              onClick={() => onCorChange(cor)}
              className="size-[30px] rounded-[8px]"
              style={{
                background: cor,
                boxShadow: corAcento === cor ? `0 0 0 2px var(--card), 0 0 0 4px ${cor}` : undefined,
              }}
            />
          ))}
        </div>
      </Field>

      <div className="flex flex-col gap-2 border-t border-border pt-3.5">
        <div className="text-[12.5px] font-semibold">Navegação</div>
        {header.navItems.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5">
            <Input
              value={item.label}
              onChange={(e) => onUpdateNav(item.id, { label: e.target.value })}
              placeholder="Rótulo"
              className="flex-1"
            />
            <select
              value={item.secaoId}
              onChange={(e) => onUpdateNav(item.id, { secaoId: e.target.value })}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-[12.5px] outline-none focus-visible:border-ring dark:bg-input/30"
            >
              <option value="topo">Topo</option>
              {secoes.map((s) => (
                <option key={s.id} value={s.id}>
                  {secaoLabel(secoes, s)}
                </option>
              ))}
              <option value="rodape">Rodapé</option>
            </select>
            <button onClick={() => onRemoveNav(item.id)} className="p-1 text-muted-foreground hover:text-destructive">
              <X size={14} />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddNav} className="mt-1 justify-center gap-1.5">
          <Plus size={13} /> Adicionar link
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seções panel — generic field/item editor driven entirely by SECAO_BLOCKS
// ---------------------------------------------------------------------------

function SecaoEditor({
  secao,
  onCampoChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: {
  secao: Secao;
  onCampoChange: (chave: string, valor: string) => void;
  onItemChange: (itemId: string, chave: string, valor: string) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const def = SECAO_BLOCKS[secao.tipo];
  if (!def) return null;
  const itens = secao.itens ?? [];

  return (
    <div className="flex flex-col gap-3.5 border-t border-border pt-3.5">
      <div className="text-[13px] font-semibold">Editando: {def.nome}</div>

      {def.campos.map((campoDef) => (
        <CampoField key={campoDef.key} def={campoDef} valor={secao.campos[campoDef.key] ?? ""} onChange={(v) => onCampoChange(campoDef.key, v)} />
      ))}

      {def.itens && (
        <div className="flex flex-col gap-3 border-t border-border pt-3.5">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">{def.itens.label}s</div>
          {itens.map((item, idx) => (
            <div key={item.id} className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-muted-foreground">
                  {def.itens!.label} #{idx + 1}
                </span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={itens.length <= def.itens!.min}
                  className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-25"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {def.itens!.campos.map((campoDef) => (
                <CampoField
                  key={campoDef.key}
                  def={campoDef}
                  valor={item.campos[campoDef.key] ?? ""}
                  onChange={(v) => onItemChange(item.id, campoDef.key, v)}
                />
              ))}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddItem}
            disabled={itens.length >= def.itens.max}
            className="justify-center gap-1.5"
          >
            <Plus size={13} /> Adicionar {def.itens.label}
          </Button>
        </div>
      )}
    </div>
  );
}

function CampoField({ def, valor, onChange }: { def: CampoDef; valor: string; onChange: (v: string) => void }) {
  if (def.tipo === "booleano") {
    return (
      <label className="flex items-center gap-2 text-[12.5px] text-foreground">
        <input
          type="checkbox"
          checked={valor === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="size-4 rounded border-border accent-primary"
        />
        {def.label}
      </label>
    );
  }
  return (
    <Field label={def.label}>
      {def.tipo === "textarea" ? (
        <Textarea value={valor} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} rows={3} />
      ) : (
        <Input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} />
      )}
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Add seção dialog
// ---------------------------------------------------------------------------

function AddSecaoDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (tipo: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar seção</DialogTitle>
          <DialogDescription>Escolha o tipo de bloco para adicionar ao final da página.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
          {Object.values(SECAO_BLOCKS).map((def) => (
            <button
              key={def.tipo}
              onClick={() => onPick(def.tipo)}
              className="flex flex-col gap-0.5 rounded-[9px] border border-border px-3 py-2.5 text-left hover:border-primary hover:bg-muted"
            >
              <span className="text-[13px] font-semibold text-foreground">{def.nome}</span>
              <span className="text-[11.5px] text-muted-foreground">{def.desc}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Footer panel
// ---------------------------------------------------------------------------

function FooterPanel({
  footer,
  onChange,
  onAddRede,
  onUpdateRede,
  onRemoveRede,
}: {
  footer: FooterConfig;
  onChange: (patch: Partial<FooterConfig>) => void;
  onAddRede: () => void;
  onUpdateRede: (id: string, patch: Partial<RedeSocial>) => void;
  onRemoveRede: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <Field label="Texto do rodapé">
        <Textarea value={footer.texto} onChange={(e) => onChange({ texto: e.target.value })} rows={2} />
      </Field>
      <Field label="Endereço">
        <Input value={footer.endereco} onChange={(e) => onChange({ endereco: e.target.value })} />
      </Field>
      <Field label="Telefone">
        <Input value={footer.telefone} onChange={(e) => onChange({ telefone: e.target.value })} />
      </Field>
      <Field label="E-mail">
        <Input value={footer.email} onChange={(e) => onChange({ email: e.target.value })} />
      </Field>

      <div className="flex flex-col gap-2 border-t border-border pt-3.5">
        <div className="text-[12.5px] font-semibold">Redes sociais</div>
        {footer.redesSociais.map((rede) => (
          <div key={rede.id} className="flex items-center gap-1.5">
            <Input
              value={rede.rede}
              onChange={(e) => onUpdateRede(rede.id, { rede: e.target.value })}
              placeholder="Instagram"
              className="w-[120px]"
            />
            <Input
              value={rede.url}
              onChange={(e) => onUpdateRede(rede.id, { url: e.target.value })}
              placeholder="https://instagram.com/..."
              className="flex-1"
            />
            <button onClick={() => onRemoveRede(rede.id)} className="p-1 text-muted-foreground hover:text-destructive">
              <X size={14} />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddRede} className="mt-1 justify-center gap-1.5">
          <Plus size={13} /> Adicionar rede social
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WhatsApp panel
// ---------------------------------------------------------------------------

function WhatsappPanel({
  whatsapp,
  onChange,
}: {
  whatsapp: WhatsappConfig;
  onChange: (patch: Partial<WhatsappConfig>) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <Field label="">
        <label className="flex items-center gap-2 text-[12.5px] text-foreground">
          <input
            type="checkbox"
            checked={whatsapp.ativo}
            onChange={(e) => onChange({ ativo: e.target.checked })}
            className="size-4 rounded border-border accent-primary"
          />
          Botão flutuante ativo
        </label>
      </Field>

      <Field label="Número">
        <Input
          value={whatsapp.numero}
          onChange={(e) => onChange({ numero: e.target.value.replace(/\D/g, "") })}
          placeholder="5511999998888"
        />
        <span className="text-[11px] text-muted-foreground">Código do país + DDD + número, só dígitos.</span>
      </Field>

      <Field label="Mensagem padrão">
        <Textarea value={whatsapp.mensagem} onChange={(e) => onChange({ mensagem: e.target.value })} rows={2} />
      </Field>

      {whatsapp.ativo && (
        <div className="flex flex-col gap-2 border-t border-border pt-3.5">
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Prévia</div>
          <div className="relative h-[84px] overflow-hidden rounded-[10px] border border-border bg-background">
            <div
              className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full"
              style={{ background: "#25D366", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.4)" }}
            >
              <span className="text-[18px]">💬</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-[12px] font-normal text-muted-foreground">{label}</Label>}
      {children}
    </div>
  );
}
