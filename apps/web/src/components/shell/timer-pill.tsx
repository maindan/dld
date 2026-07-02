"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { formatHMS } from "@/lib/format";
import type { ExpedienteAtivo } from "@/lib/queries/expediente";

export function TimerPill({ expediente }: { expediente: ExpedienteAtivo | null }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(expediente?.elapsedSeconds ?? 0);

  // Resync the displayed count whenever the server recomputes elapsedSeconds
  // (a fresh fetch after start/pause/resume/stop, or the 30s refresh below).
  const syncKey = expediente ? `${expediente.id}:${expediente.tickFromMs}:${expediente.elapsedSeconds}` : null;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setSeconds(expediente?.elapsedSeconds ?? 0);
  }

  useEffect(() => {
    if (!expediente || expediente.status !== "running") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [expediente]);

  // Re-fetch periodically so the pill notices a pause/stop triggered from another tab/device.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(id);
  }, [router]);

  if (!expediente) return null;

  const running = expediente.status === "running";
  const dot = running ? "#34d399" : "#fbbf24";
  const border = running ? "rgba(52,211,153,0.35)" : "rgba(251,191,36,0.35)";

  return (
    <a
      href="/workstation"
      className="flex flex-none items-center gap-2 rounded-[9px] border px-[11px] py-1.5 hover:border-success"
      style={{ borderColor: border, background: "rgba(52,211,153,0.06)" }}
    >
      <span
        className="flex"
        style={{ color: dot, animation: running ? "dlPulse 1.6s ease-in-out infinite" : "none" }}
      >
        <Clock size={15} />
      </span>
      <span className="font-mono text-[13px] font-semibold">{formatHMS(seconds)}</span>
      <span className="max-w-[110px] truncate text-[11px] text-muted-foreground">
        {expediente.status === "paused" ? "pausado" : "trabalhando"}
      </span>
    </a>
  );
}
