import { notFound } from "next/navigation";
import { getLandingPageDetail } from "@/lib/queries/landing-pages";
import { LandingPageEditor } from "@/components/workstation/landing-page-editor";

export default async function LandingPageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const landingPage = await getLandingPageDetail(id);
  if (!landingPage) notFound();

  return <LandingPageEditor landingPage={landingPage} />;
}
