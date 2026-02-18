import "./globals.css";
import "leaflet/dist/leaflet.css";

import Providers from "./providers";

export const metadata = {
  title: "MEWP Spotter",
  description: "Spot aerial lifts in the wild.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
