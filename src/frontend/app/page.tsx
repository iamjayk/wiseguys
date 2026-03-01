import Link from "next/link";
import { TitleGrid } from "@/components/TitleGrid";

export default function Home() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 md:mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Wise Guys
            </h1>
            <p className="mt-2 text-zinc-400">
              Gangster movies & TV — The Godfather, Goodfellas, The Sopranos, and more
            </p>
          </div>
          <Link
            href="/titles/new"
            className="rounded-lg bg-zinc-100 text-zinc-900 font-medium py-2 px-4 hover:bg-white shrink-0"
          >
            Add title
          </Link>
        </header>
        <TitleGrid />
      </div>
    </main>
  );
}
