import type { Metadata, Viewport } from "next";
import { Archivo, Chakra_Petch, JetBrains_Mono, Silkscreen } from "next/font/google";
import { BRAND } from "@/config/brand";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletModalProvider } from "@/components/wallet/WalletButton";
import { BootScreen } from "@/components/site/BootScreen";
import { BOOT_KEY } from "@/config/game";
import "./globals.css";

const chakra = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-chakra", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-archivo", display: "swap" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono", display: "swap" });
const silk = Silkscreen({ subsets: ["latin"], weight: ["400"], variable: "--font-silk", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: `${BRAND.name} | ${BRAND.slogan}`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} | ${BRAND.slogan}`,
    description: BRAND.tagline,
    url: BRAND.url,
  },
  twitter: { card: "summary_large_image", site: BRAND.xHandle, creator: BRAND.xHandle, title: `${BRAND.name} | ${BRAND.slogan}`, description: BRAND.tagline },
};

export const viewport: Viewport = {
  themeColor: "#e4e2dc",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: skips the boot screen for the rest of the session.
const bootCheck = `try{if(sessionStorage.getItem(${JSON.stringify(BOOT_KEY)})==="1")document.documentElement.dataset.booted="1"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${chakra.variable} ${archivo.variable} ${jbmono.variable} ${silk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootCheck }} />
      </head>
      <body>
        <BootScreen />
        <WalletProvider>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
