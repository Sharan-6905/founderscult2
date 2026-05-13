import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoundersCult | The Premium Network for Builders",
  description: "Connect, share ideas, and build communities with founders and indie hackers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
