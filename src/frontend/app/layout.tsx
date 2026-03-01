import "./globals.css";
import type { Metadata } from "next";
import { ApolloProvider } from "@/components/ApolloProvider";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Wise Guys — Gangster Movies & TV",
  description: "Gangster movie and TV database — The Godfather, Goodfellas, The Sopranos, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider>
          <AuthGuard>{children}</AuthGuard>
        </ApolloProvider>
      </body>
    </html>
  );
}
