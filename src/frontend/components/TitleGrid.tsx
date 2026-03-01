"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_TITLES, type GetTitlesData } from "@/lib/graphql/titles";

export function TitleGrid() {
  const { data, loading, error } = useQuery<GetTitlesData>(GET_TITLES);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
          >
            <div className="h-6 bg-zinc-700 rounded w-3/4 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-700 rounded w-full" />
              <div className="h-4 bg-zinc-700 rounded w-5/6" />
              <div className="h-4 bg-zinc-700 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
        <p className="font-medium">Failed to load titles</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const titles = data?.titles ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {titles.map((t) => (
        <Link key={t.id} href={`/titles/${t.id}`}>
          <article
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6 transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-white truncate">
                {t.name}
              </h3>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                t.type === "movie"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-violet-500/20 text-violet-400"
              }`}
            >
              {t.type === "movie" ? "Movie" : "TV"}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mb-2">
            {t.type === "movie"
              ? t.year
              : `${t.year}${t.yearEnd ? ` – ${t.yearEnd}` : ""}`}
          </p>
          {t.description && (
            <p className="text-sm text-zinc-400 line-clamp-3 mb-3">
              {t.description}
            </p>
          )}
          {t.cast && t.cast.length > 0 && (
            <p className="text-xs text-zinc-500 truncate" title={t.cast.join(", ")}>
              {t.cast.slice(0, 3).join(", ")}
              {t.cast.length > 3 ? "…" : ""}
            </p>
          )}
          </article>
        </Link>
      ))}
    </div>
  );
}
