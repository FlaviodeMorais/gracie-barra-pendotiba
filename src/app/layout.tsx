import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/public/InstallPrompt";
import ServiceWorkerRegistrar from "@/components/public/ServiceWorkerRegistrar";

const montserrat = Montserrat({
  weight: ["800"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#dc2626",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  applicationName: "Gracie Barra Pendotiba",
  title: {
    default: "Gracie Barra Pendotiba | Jiu-Jitsu & Defesa Pessoal - Niterói",
    template: "%s | GB Pendotiba",
  },
  description:
    "Academia de Jiu-Jitsu, Muay Thai, Defesa Pessoal e Ginástica Artística em Pendotiba, Niterói - RJ. Mestre André Amaral, faixa-preta 2º grau.",
  keywords: [
    "jiu-jitsu",
    "muay thai",
    "defesa pessoal",
    "niterói",
    "pendotiba",
    "gracie barra",
    "academia",
    "arte marcial",
    "bjj",
  ],
  authors: [{ name: "Gracie Barra Pendotiba" }],
  creator: "Gracie Barra Pendotiba",
  publisher: "Gracie Barra Pendotiba",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GB Pendotiba",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Gracie Barra Pendotiba",
    title: "Gracie Barra Pendotiba | Jiu-Jitsu & Defesa Pessoal",
    description:
      "Academia de Jiu-Jitsu, Muay Thai e Defesa Pessoal em Pendotiba, Niterói - RJ.",
    images: [{ url: "/logo-gracie-barra.jpg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "Gracie Barra Pendotiba",
    description: "Jiu-Jitsu & Defesa Pessoal em Niterói - RJ",
    images: ["/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32x32.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${montserrat.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#dc2626" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        {children}
        <InstallPrompt />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
