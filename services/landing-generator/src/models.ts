export interface LandingPageModel {
  id: string;
  nome: string;
  desc: string;
}

/** Every entry here must have a matching directory under src/templates/<id>. */
export const LANDING_PAGE_MODELS: LandingPageModel[] = [
  { id: "base", nome: "Base", desc: "Header, hero e contato — ponto de partida minimo" },
];
