import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "danlimadev — Sistema de gerenciamento de freelas",
    short_name: "danlimadev",
    description: "Orçamentos, cronograma, tasks, metas, blog e portfolio num só lugar.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#0e1116",
    theme_color: "#0e1116",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
