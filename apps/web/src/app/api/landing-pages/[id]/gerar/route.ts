import { NextResponse } from "next/server";
import { generateLandingPageZip } from "@danlimadev/landing-generator";
import { getLandingPageGerarInput, marcarLandingPageGerada } from "@/lib/queries/landing-pages";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await getLandingPageGerarInput(id);
  if (!input) return NextResponse.json({ error: "Rascunho não encontrado" }, { status: 404 });

  const { buffer, result } = await generateLandingPageZip(input);
  await marcarLandingPageGerada(id, result.nomeArquivo);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.nomeArquivo}"`,
    },
  });
}
