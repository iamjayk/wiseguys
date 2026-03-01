"use client";

import { useState } from "react";
import type {
  Title,
  CreateTitleInput,
  UpdateTitleInput,
} from "@/lib/graphql/titles";

interface TitleFormProps {
  title?: Title | null;
  onSubmit: (input: CreateTitleInput | UpdateTitleInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export function TitleForm({
  title,
  onSubmit,
  onCancel,
  submitLabel,
}: TitleFormProps) {
  const [type, setType] = useState(title?.type ?? "movie");
  const [name, setName] = useState(title?.name ?? "");
  const [year, setYear] = useState(title?.year?.toString() ?? "");
  const [yearEnd, setYearEnd] = useState(title?.yearEnd?.toString() ?? "");
  const [description, setDescription] = useState(title?.description ?? "");
  const [posterUrl, setPosterUrl] = useState(title?.posterUrl ?? "");
  const [castStr, setCastStr] = useState((title?.cast ?? []).join(", "));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const cast = castStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const yearNum = parseInt(year, 10);
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (!year || isNaN(yearNum)) {
      setError("Year is required and must be a number");
      setLoading(false);
      return;
    }
    try {
      if (title) {
        await onSubmit({
          type: type as "movie" | "tv",
          name: name.trim(),
          year: yearNum,
          yearEnd: yearEnd ? parseInt(yearEnd, 10) : null,
          description: description.trim() || null,
          posterUrl: posterUrl.trim() || null,
          cast: cast.length ? cast : null,
        });
      } else {
        await onSubmit({
          type: type as "movie" | "tv",
          name: name.trim(),
          year: yearNum,
          yearEnd: yearEnd ? parseInt(yearEnd, 10) : null,
          description: description.trim() || null,
          posterUrl: posterUrl.trim() || null,
          cast: cast.length ? cast : null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Name *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="Title name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Year *
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="e.g. 1972"
          />
        </div>
        {type === "tv" && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              End year
            </label>
            <input
              type="number"
              value={yearEnd}
              onChange={(e) => setYearEnd(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="e.g. 2007"
            />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none"
          placeholder="Plot summary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Poster URL
        </label>
        <input
          type="url"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Cast (comma-separated)
        </label>
        <input
          value={castStr}
          onChange={(e) => setCastStr(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="Al Pacino, Robert De Niro"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-100 text-zinc-900 font-medium py-2 px-4 hover:bg-white disabled:opacity-50"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-600 text-zinc-300 py-2 px-4 hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
