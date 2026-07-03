"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Copy,
  Eye,
  FileSignature,
  FileText,
  GitBranch,
  Info,
  MessagesSquare,
  Pencil,
  Plus,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import {
  createOrcamentoAction,
  createObservacaoAction,
  createReuniaoAction,
  createContratoAction,
  toggleContratoStatusAction,
  updateFreelaResumoAction,
} from "@/lib/actions/freelas";
import { OrcamentoCard } from "./orcamento-card";
import { FinanceiroDashboard } from "./financeiro-dashboard";
import { AtividadesDashboard } from "./atividades-dashboard";
import { formatBRL, formatDateLong, formatDateShort } from "@/lib/format";
import { CONTRATO_MODELOS, type ContratoModeloTipo } from "@/lib/contrato-modelos";
import type { FreelaDetail as FreelaDetailData, OrcamentoItemView } from "@/lib/queries/freelas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Module accent for Freelas (see lib/nav.ts). Used for tab icons and the cronograma timeline. */
const PINK = "#f472b6";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4">
      <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className={mono ? "font-mono text-[12px] text-[#c9d1dc]" : "text-[13px] text-[#e6eaf0]"}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-4">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="font-mono text-[22px] font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

type TabId = "detalhes" | "orcamentos" | "cronograma" | "reunioes" | "contratos" | "financeiro";

const TABS: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: "detalhes", label: "Detalhes", icon: Info },
  { id: "orcamentos", label: "Orçamentos", icon: FileText },
  { id: "cronograma", label: "Cronograma", icon: GitBranch },
  { id: "reunioes", label: "Reuniões", icon: MessagesSquare },
  { id: "contratos", label: "Contratos", icon: FileSignature },
  { id: "financeiro", label: "Financeiro", icon: Wallet },
];

interface ItemDraft {
  id: string;
  desc: string;
  tempo: string;
  valor: string;
  link: string;
  bullets: string;
  mostrarDetalhes: boolean;
}

function novoItemDraft(): ItemDraft {
  return { id: crypto.randomUUID(), desc: "", tempo: "", valor: "", link: "", bullets: "", mostrarDetalhes: false };
}

function NovoOrcamentoDialog({
  freelaId,
  open,
  onOpenChange,
}: {
  freelaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [prazoExec, setPrazoExec] = useState("");
  const [itens, setItens] = useState<ItemDraft[]>([novoItemDraft()]);

  const total = itens.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

  function updateItem(id: string, patch: Partial<ItemDraft>) {
    setItens((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function reset() {
    setTitulo("");
    setPrazoExec("");
    setItens([novoItemDraft()]);
  }

  function salvar() {
    const validos = itens
      .map((it) => ({
        desc: it.desc.trim(),
        tempo: it.tempo.trim(),
        valor: Number(it.valor) || 0,
        link: it.link.trim() || null,
        bullets: it.bullets
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
      }))
      .filter((it) => it.desc);
    if (!titulo.trim() || validos.length === 0 || total <= 0) return;

    const fd = new FormData();
    fd.set("titulo", titulo.trim());
    fd.set("prazoExec", prazoExec.trim());
    fd.set("data", new Date().toISOString().slice(0, 10));
    fd.set("itens", JSON.stringify(validos));
    startTransition(() => createOrcamentoAction(freelaId, fd));
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Novo orçamento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-muted-foreground">Título do orçamento *</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Fase 3 — App mobile"
                className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-muted-foreground">Prazo de execução</label>
              <input
                value={prazoExec}
                onChange={(e) => setPrazoExec(e.target.value)}
                placeholder="Ex.: 6 semanas"
                className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[12px] text-muted-foreground">Atividades — descrição, tempo estimado e valor</div>
            <div className="hidden items-center gap-2.5 px-1 text-[10.5px] tracking-wide text-muted-foreground uppercase sm:flex">
              <div className="flex-1">Atividade</div>
              <div className="w-[130px] flex-none">Tempo estimado</div>
              <div className="w-[100px] flex-none">Valor</div>
              <div className="w-[24px] flex-none" />
            </div>
            {itens.map((it) => (
              <div key={it.id} className="flex flex-col gap-1.5 rounded-[8px] border border-transparent px-1 py-1">
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <input
                    value={it.desc}
                    onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                    placeholder="Descrição da atividade / título do grupo"
                    className="min-w-[140px] flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2 text-[13px] outline-none focus:border-primary"
                  />
                  <input
                    value={it.tempo}
                    onChange={(e) => updateItem(it.id, { tempo: e.target.value })}
                    placeholder="2 semanas"
                    className="w-[130px] flex-none rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2 text-[13px] outline-none focus:border-primary"
                  />
                  <input
                    value={it.valor}
                    onChange={(e) => updateItem(it.id, { valor: e.target.value })}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="R$ 0"
                    className="w-[100px] flex-none rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2 font-mono text-[12.5px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => updateItem(it.id, { mostrarDetalhes: !it.mostrarDetalhes })}
                    className="flex size-[26px] flex-none items-center justify-center rounded-[6px] text-muted-foreground hover:bg-[#1b222c] hover:text-[#e6eaf0]"
                    title="Link e detalhes (aparecem no orçamento público)"
                  >
                    {it.mostrarDetalhes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItens((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== it.id) : prev))}
                    disabled={itens.length === 1}
                    className="flex size-[26px] flex-none items-center justify-center rounded-[6px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                  >
                    <X size={14} />
                  </button>
                </div>
                {it.mostrarDetalhes && (
                  <div className="flex flex-col gap-2 rounded-[8px] bg-[#11151c] p-2.5">
                    <input
                      value={it.link}
                      onChange={(e) => updateItem(it.id, { link: e.target.value })}
                      placeholder="Link (opcional) — ex.: https://site-do-cliente.com.br"
                      className="rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
                    />
                    <textarea
                      value={it.bullets}
                      onChange={(e) => updateItem(it.id, { bullets: e.target.value })}
                      rows={3}
                      placeholder={"Detalhes do escopo, um por linha:\n- Criação de protótipo no Figma\n- Aplicação do design no site"}
                      className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItens((prev) => [...prev, novoItemDraft()])}
              className="flex items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-[#303a47] py-2.5 text-[12.5px] text-muted-foreground hover:border-primary hover:text-[#c9d1dc]"
            >
              <Plus size={14} /> Adicionar atividade
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3.5">
            <div>
              <div className="text-[11px] text-muted-foreground">Valor total</div>
              <div className="font-mono text-[22px] font-semibold">{formatBRL(total)}</div>
            </div>
            <div className="flex-1" />
            <div className="max-w-[300px] text-[11.5px] leading-relaxed text-muted-foreground">
              Cobrado em 2 parcelas de 50% (aprovação e entrega). Uma chave de acesso público será gerada para o
              cliente aprovar — imposto e retenção de cada parcela ficam configuráveis depois, na aba Orçamentos.
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-[9px] bg-[#222b36] px-4 py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={!titulo.trim() || total <= 0}
            className="rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
          >
            Criar orçamento
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegistrarReuniaoDialog({
  freelaId,
  open,
  onOpenChange,
}: {
  freelaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(fd: FormData) {
    startTransition(() => createReuniaoAction(freelaId, fd));
    formRef.current?.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Registrar reunião</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex gap-2.5">
            <input
              name="titulo"
              required
              placeholder="Título da reunião *"
              className="min-w-0 flex-1 rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
            <input
              name="data"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-[150px] flex-none rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-2.5 text-[12px] text-muted-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Tópicos levantados (um por linha)</label>
            <textarea
              name="topicos"
              rows={4}
              placeholder={"Escopo do projeto\nDefinição de prazos\nPróximos passos"}
              className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-primary"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-[9px] bg-[#222b36] px-4 py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
            >
              Registrar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NovoContratoDialog({
  freelaId,
  open,
  onOpenChange,
}: {
  freelaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [modo, setModo] = useState<"modelo" | "anexo">("modelo");
  const [modeloTipo, setModeloTipo] = useState<ContratoModeloTipo>("prestacao");
  const [arquivoNome, setArquivoNome] = useState("");

  function reset() {
    setModo("modelo");
    setModeloTipo("prestacao");
    setArquivoNome("");
  }

  function handleSubmit(fd: FormData) {
    fd.set("modo", modo);
    fd.set("modeloTipo", modeloTipo);
    startTransition(() => createContratoAction(freelaId, fd));
    formRef.current?.reset();
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Novo contrato</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3.5">
          <input
            name="titulo"
            required
            placeholder="Título do contrato *"
            className="rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
          />

          <Tabs value={modo} onValueChange={(v) => setModo(v as "modelo" | "anexo")}>
            <TabsList className="w-full">
              <TabsTrigger value="modelo" className="flex-1">
                Usar modelo
              </TabsTrigger>
              <TabsTrigger value="anexo" className="flex-1">
                Anexar arquivo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modelo" className="mt-3">
              <div className="flex flex-col gap-2">
                {(Object.entries(CONTRATO_MODELOS) as [ContratoModeloTipo, string][]).map(([id, nome]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setModeloTipo(id)}
                    className="flex items-center gap-2.5 rounded-[9px] border bg-[#11151c] px-3 py-2.5 text-left text-[13px]"
                    style={{ borderColor: modeloTipo === id ? PINK : "var(--border)" }}
                  >
                    <span
                      className="flex size-3.5 flex-none items-center justify-center rounded-full border"
                      style={{ borderColor: modeloTipo === id ? PINK : "#303a47" }}
                    >
                      {modeloTipo === id && <span className="size-1.5 rounded-full" style={{ background: PINK }} />}
                    </span>
                    {nome}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="anexo" className="mt-3">
              <label className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#3a4553] px-4 py-6 text-center text-[12px] text-muted-foreground hover:border-primary hover:text-[#c9d1dc]">
                <Upload size={18} />
                {arquivoNome || "arraste o PDF do contrato ou clique"}
                <input
                  type="file"
                  name="arquivo"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setArquivoNome(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-[9px] bg-[#222b36] px-4 py-2.5 text-[13px] font-medium text-[#c9d1dc] hover:bg-[#2a3441]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-[9px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
            >
              Criar contrato
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface TimelineEntry {
  orcamentoId: string;
  orcamentoTitulo: string;
  item: OrcamentoItemView;
}

const ORCAMENTOS_LIBERADOS = new Set(["aprovado", "pago_parcial", "pago_total"]);

export function FreelaDetail({
  freela,
  tabInicial,
}: {
  freela: FreelaDetailData;
  tabInicial?: TabId;
}) {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>(tabInicial ?? "detalhes");
  const [copiado, setCopiado] = useState(false);
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showContrato, setShowContrato] = useState(false);
  const [editandoResumo, setEditandoResumo] = useState(false);
  const [resumoRascunho, setResumoRascunho] = useState(freela.resumo);

  function salvarResumo() {
    startTransition(() => updateFreelaResumoAction(freela.id, resumoRascunho));
    setEditandoResumo(false);
  }

  function copiarCronograma() {
    const url = `${window.location.origin}/cronograma/${freela.chaveCrono}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  const timeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [];
    for (const o of freela.orcamentos) {
      if (!ORCAMENTOS_LIBERADOS.has(o.status)) continue;
      for (const item of o.itens) {
        if (!item.prazo) continue;
        entries.push({ orcamentoId: o.id, orcamentoTitulo: o.titulo, item });
      }
    }
    return entries.sort((a, b) => {
      const pa = a.item.prazo ?? "";
      const pb = b.item.prazo ?? "";
      return pa < pb ? -1 : pa > pb ? 1 : 0;
    });
  }, [freela.orcamentos]);

  const financeiroRows = useMemo(
    () =>
      freela.orcamentos.map((o) => ({
        id: o.id,
        numero: o.numero,
        titulo: o.titulo,
        valor: o.valor,
        pago: o.pago,
        pagoLiquido: o.pagoLiquido,
        pct: o.valor > 0 ? Math.min(100, (o.pago / o.valor) * 100) : 0,
      })),
    [freela.orcamentos]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href="/freelas"
          className="flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-muted-foreground hover:border-[#3a4553] hover:text-[#e6eaf0]"
        >
          <ChevronLeft size={14} /> Freelas
        </Link>
        <div className="flex-1" />
        <button
          onClick={copiarCronograma}
          className="flex flex-none items-center gap-1.5 rounded-[9px] border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-[#e6eaf0]"
        >
          <Eye size={14} style={{ color: PINK }} /> {copiado ? "Copiado!" : "Cronograma público"}
          <span className="font-mono text-[10.5px] text-muted-foreground">{freela.chaveCrono}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-border bg-card p-4">
        <div
          className="flex size-11 flex-none items-center justify-center rounded-[12px] font-mono text-[18px] font-bold"
          style={{ background: freela.cor, color: "#0e1116" }}
        >
          {freela.nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-[160px] flex-1">
          <div className="text-[16px] font-semibold">{freela.nome}</div>
          <div className="text-[12px] text-muted-foreground">{freela.tipo}</div>
        </div>
        <div className="flex flex-wrap gap-5">
          <Field label="Cliente" value={freela.clienteNome} />
          <Field label="Empresa" value={freela.clienteEmpresa} />
          <Field label="E-mail" value={freela.clienteEmail} mono />
          <Field label="WhatsApp" value={freela.clienteWhatsapp} mono />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <div className="mb-1 flex flex-wrap items-center gap-3">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                <t.icon size={14} style={{ color: tab === t.id ? PINK : undefined }} />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1" />
          {tab === "orcamentos" && (
            <button
              onClick={() => setShowNovoOrcamento(true)}
              className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground"
            >
              <Plus size={14} /> Novo orçamento
            </button>
          )}
          {tab === "reunioes" && (
            <button
              onClick={() => setShowMeeting(true)}
              className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground"
            >
              <Plus size={14} /> Registrar reunião
            </button>
          )}
          {tab === "contratos" && (
            <button
              onClick={() => setShowContrato(true)}
              className="flex items-center gap-1.5 rounded-[9px] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground"
            >
              <Plus size={14} /> Novo contrato
            </button>
          )}
        </div>

        <TabsContent value="detalhes">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10.5px] tracking-wide text-muted-foreground uppercase">Sobre o projeto</div>
                {!editandoResumo && (
                  <button
                    onClick={() => {
                      setResumoRascunho(freela.resumo);
                      setEditandoResumo(true);
                    }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                )}
              </div>

              {editandoResumo ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={resumoRascunho}
                    onChange={(e) => setResumoRascunho(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder="Descreva o projeto…"
                    className="resize-y rounded-[8px] border border-border bg-[#0e1116] px-3 py-2.5 text-[13px] leading-relaxed text-[#e6eaf0] outline-none focus:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={salvarResumo}
                      className="flex items-center gap-1.5 rounded-[8px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
                    >
                      <Check size={13} /> Salvar
                    </button>
                    <button
                      onClick={() => setEditandoResumo(false)}
                      className="flex items-center gap-1.5 rounded-[8px] bg-[#222b36] px-3 py-1.5 text-[12px] text-[#c9d1dc] hover:bg-[#2a3441]"
                    >
                      <X size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] leading-relaxed text-[#c9d1dc]">
                  {freela.resumo || "Nenhum resumo cadastrado."}
                </div>
              )}

              <div className="mt-1 grid grid-cols-2 gap-4 border-t border-[#1f2733] pt-3 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <div className="font-mono text-[15px] font-semibold text-success">
                    {formatBRL(freela.totalPagoLiquido)}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">recebido</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-mono text-[15px] font-semibold text-[#c9d1dc]">
                    {formatBRL(freela.totalAReceber)}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">a receber</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-mono text-[15px] font-semibold text-destructive">
                    {formatBRL(freela.totalImposto)}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">imposto pago</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-mono text-[15px] font-semibold text-[#e6eaf0]">
                    {formatBRL(freela.totalValor)}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">total dos contratos</div>
                </div>
              </div>
            </div>

            <Card title="Observações">
              <form
                action={(fd) => startTransition(() => createObservacaoAction(freela.id, fd))}
                className="flex items-center gap-2"
              >
                <input
                  name="texto"
                  required
                  placeholder="Nova observação..."
                  className="flex-1 rounded-[8px] border border-border bg-[#0e1116] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
                />
                <button type="submit" className="rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground">
                  +
                </button>
              </form>
              <div className="flex flex-col gap-1.5">
                {freela.observacoes.length === 0 && (
                  <div className="py-2 text-center text-[12px] text-muted-foreground">Nada por aqui.</div>
                )}
                {freela.observacoes.map((o) => (
                  <div key={o.id} className="flex flex-col gap-1 rounded-[8px] bg-[#1b222c] px-2.5 py-2 text-[12.5px] text-[#c9d1dc]">
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      registrado em {formatDateLong(o.data)}
                    </span>
                    {o.texto}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orcamentos">
          <Card title="Orçamentos">
            {freela.orcamentos.length === 0 ? (
              <div className="py-4 text-center text-[12.5px] text-muted-foreground">Nenhum orçamento ainda.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {freela.orcamentos.map((o) => (
                  <OrcamentoCard key={o.id} freelaId={freela.id} orcamento={o} />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="cronograma">
          <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-[#1f2733] bg-[#11151c] px-3.5 py-3">
              <div
                className="flex size-9 flex-none items-center justify-center rounded-[10px] font-mono text-[13px] font-bold"
                style={{ background: freela.cor, color: "#0e1116" }}
              >
                {freela.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-[#e6eaf0]">{freela.nome}</div>
                <div className="truncate text-[11.5px] text-muted-foreground">
                  {freela.clienteNome}
                  {freela.tipo && ` · ${freela.tipo}`}
                </div>
              </div>
              <div className="flex flex-none flex-col items-end gap-0.5 font-mono text-[11px] text-muted-foreground">
                <span>{formatBRL(freela.totalPagoLiquido)} recebido</span>
                <span>{formatBRL(freela.totalAReceber)} a receber</span>
              </div>
            </div>

            <div className="text-[12px] text-muted-foreground">
              Linha do tempo das entregas dos orçamentos aprovados e pagos.
            </div>

            {timeline.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-border p-6 text-center text-[12.5px] text-muted-foreground">
                Nenhuma entrega liberada — confirme o recebimento de um orçamento aprovado.
              </div>
            ) : (
              <div className="flex flex-col">
                {timeline.map((entry, idx) => {
                  const nodeColor = entry.item.done ? "#34d399" : PINK;
                  return (
                    <div key={entry.item.id} className="flex items-stretch gap-4">
                      <div className="w-[92px] flex-none pt-3 text-right font-mono text-[11px] text-muted-foreground">
                        {formatDateLong(entry.item.prazo)}
                      </div>
                      <div className="flex w-6 flex-none flex-col items-center">
                        <div
                          className="w-[2px] flex-1"
                          style={{ background: idx === 0 ? "transparent" : "#262e39", minHeight: 12 }}
                        />
                        <div
                          className="size-[13px] flex-none rounded-full"
                          style={{ background: nodeColor, boxShadow: `0 0 0 3px ${nodeColor}30` }}
                        />
                        <div
                          className="w-[2px] flex-1"
                          style={{
                            background: idx === timeline.length - 1 ? "transparent" : "#262e39",
                            minHeight: 12,
                          }}
                        />
                      </div>
                      <div className="flex-1 py-2.5">
                        <div
                          className="flex items-center gap-2.5 rounded-[8px] border border-[#1f2733] bg-[#11151c] px-3.5 py-2.5"
                          style={{ borderLeft: `3px solid ${nodeColor}` }}
                        >
                          <div className="min-w-0 flex-1">
                            <div
                              className={entry.item.done ? "text-[13px] text-muted-foreground line-through" : "text-[13px] text-[#e6eaf0]"}
                            >
                              {entry.item.desc}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {entry.orcamentoTitulo}
                              {entry.item.tempo && ` · ${entry.item.tempo}`}
                            </div>
                          </div>
                          {entry.item.done && <Check size={14} className="flex-none text-success" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reunioes">
          {freela.reunioes.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border p-8 text-center text-[12.5px] text-muted-foreground">
              Nenhuma reunião registrada ainda.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {freela.reunioes.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-[30px] flex-none items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <MessagesSquare size={15} />
                    </div>
                    <div className="flex-1 text-[14px] font-semibold">{r.titulo}</div>
                    <div className="font-mono text-[11.5px] text-muted-foreground">{formatDateShort(r.data)}</div>
                  </div>
                  {r.topicos.length > 0 && (
                    <div className="flex flex-col gap-1.5 pl-[40px]">
                      {r.topicos.map((tp, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-[#c9d1dc]">
                          <span className="mt-[7px] size-[5px] flex-none rounded-full bg-muted-foreground" />
                          {tp}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contratos">
          {freela.contratos.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border p-8 text-center text-[12.5px] text-muted-foreground">
              Nenhum contrato — crie a partir de um modelo ou anexe um arquivo.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {freela.contratos.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border bg-card px-4 py-3"
                >
                  <div className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-[#60a5fa1f] text-[#60a5fa]">
                    <FileSignature size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">{c.titulo}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {c.tipo} · {formatDateShort(c.data)}
                    </div>
                  </div>
                  {c.modo === "anexo" && c.arquivoPath && (
                    <a
                      href={c.arquivoPath}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-none text-[11.5px] text-primary hover:underline"
                    >
                      Ver PDF
                    </a>
                  )}
                  <button
                    onClick={() =>
                      startTransition(() => toggleContratoStatusAction(freela.id, c.id, c.status !== "assinado"))
                    }
                    className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      color: c.status === "assinado" ? "#34d399" : "#fbbf24",
                      background: c.status === "assinado" ? "#34d39920" : "#fbbf2420",
                    }}
                  >
                    {c.status === "assinado" ? "Assinado" : "Pendente"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financeiro">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-4">
              <StatCard label="Valor total" value={formatBRL(freela.totalValor)} color="#e6eaf0" />
              <StatCard label="Total recebido" value={formatBRL(freela.totalPagoLiquido)} color="#34d399" />
              <StatCard label="Total de imposto" value={formatBRL(freela.totalImposto)} color="#f87171" />
              <StatCard label="Total a receber" value={formatBRL(freela.totalAReceber)} color="#fbbf24" />
            </div>
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">
              &quot;Total recebido&quot; já é o valor líquido (descontando o imposto pago na emissão da NF e a
              retenção que o cliente aplica sobre a nota). Ajuste os percentuais em cada orçamento na aba Orçamentos.
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FinanceiroDashboard
                totalValor={freela.totalValor}
                totalPagoLiquido={freela.totalPagoLiquido}
                totalImposto={freela.totalImposto}
                totalAReceber={freela.totalAReceber}
              />
              <AtividadesDashboard orcamentos={freela.orcamentos} />
            </div>

            <div className="rounded-[14px] border border-border bg-card">
              {financeiroRows.length === 0 ? (
                <div className="py-8 text-center text-[12.5px] text-muted-foreground">Nenhum orçamento ainda.</div>
              ) : (
                <>
                  {financeiroRows.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center gap-3 border-b border-[#1f2733] px-4 py-3 last:border-b-0"
                    >
                      <div className="w-[58px] flex-none font-mono text-[11px] text-muted-foreground">
                        ORC-{String(r.numero).padStart(3, "0")}
                      </div>
                      <div className="min-w-[120px] flex-1 text-[13px]">{r.titulo}</div>
                      <div className="w-[110px] flex-none">
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#11151c]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.pct}%`, background: r.pct >= 100 ? "#34d399" : "#fbbf24" }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-none gap-3.5 font-mono text-[12px]">
                        <div className="w-[72px] text-right text-success">{formatBRL(r.pago)}</div>
                        <div className="w-[72px] text-right" style={{ color: "#2dd4bf" }}>
                          {formatBRL(r.pagoLiquido)}
                        </div>
                        <div className="w-[72px] text-right text-muted-foreground">
                          {formatBRL(Math.max(0, r.valor - r.pago))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-3.5 px-4 py-2.5 font-mono text-[10.5px] text-muted-foreground">
                    <div className="w-[72px] text-right text-success">pago</div>
                    <div className="w-[72px] text-right" style={{ color: "#2dd4bf" }}>
                      líquido
                    </div>
                    <div className="w-[72px] text-right">pendente</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <NovoOrcamentoDialog freelaId={freela.id} open={showNovoOrcamento} onOpenChange={setShowNovoOrcamento} />
      <RegistrarReuniaoDialog freelaId={freela.id} open={showMeeting} onOpenChange={setShowMeeting} />
      <NovoContratoDialog freelaId={freela.id} open={showContrato} onOpenChange={setShowContrato} />
    </div>
  );
}
