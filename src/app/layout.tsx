import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preorder Logistics - ລະບົບຈັດການພຣີອໍເດີ ຈີນ-ລາວ ໄທ-ລາວ",
  description: "ລະບົບຈັດການພຣີອໍເດີ ສິນຄ້າຈາກຈີນ-ລາວ ແລະ ໄທ-ລາວ ພ້ອມພິມບິນ Thermal ແລະ ຄິດໄລ່ເງິນກີບອັດຕະໂນມັດ",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080c14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lo" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-slate-100 min-h-screen antialiased flex flex-col font-lao">
        <div className="flex-1 w-full max-w-lg mx-auto bg-background min-h-screen relative shadow-2xl border-x border-slate-800/60 pb-24">
          {children}
        </div>
      </body>
    </html>
  );
}
