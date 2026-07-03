const STATUS_INFO: Record<string, { label: string; cor: string }> = {
  rascunho: { label: "Rascunho", cor: "#8b96a5" },
  enviado: { label: "Aguardando cliente", cor: "#818cf8" },
  aprovado: { label: "Aprovado — confirmar pagamento", cor: "#fbbf24" },
  pago_parcial: { label: "Pago parcial", cor: "#2dd4bf" },
  pago_total: { label: "Pago total", cor: "#34d399" },
  recusado: { label: "Recusado", cor: "#f87171" },
};

export function StatusBadge({ status }: { status: string }) {
  const info = STATUS_INFO[status] ?? { label: status, cor: "#8b96a5" };
  return (
    <span
      className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: info.cor, background: `${info.cor}1f` }}
    >
      {info.label}
    </span>
  );
}
