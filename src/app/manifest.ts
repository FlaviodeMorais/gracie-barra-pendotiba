import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gracie Barra Pendotiba",
    short_name: "GB Pendotiba",
    description: "Jiu-Jitsu, Muay Thai, Defesa Pessoal e Ginástica Artística em Niterói - RJ",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0a",
    theme_color: "#dc2626",
    categories: ["sports", "fitness", "education"],
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/logo-gracie-barra.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        label: "Gracie Barra Pendotiba - Academia de Jiu-Jitsu",
      },
    ],
    shortcuts: [
      {
        name: "Agendar Aula",
        short_name: "Agendar",
        description: "Agende uma aula teste gratuita",
        url: "/agendar",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Eventos",
        short_name: "Eventos",
        description: "Ver próximos eventos e campeonatos",
        url: "/",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
