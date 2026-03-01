"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_TITLE,
  GET_TITLES,
  UPDATE_TITLE,
  DELETE_TITLE,
  type GetTitleData,
  type UpdateTitleInput,
} from "@/lib/graphql/titles";
import { TitleForm } from "@/components/TitleForm";

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : NaN;
  const [editing, setEditing] = useState(false);

  const { data, loading, error } = useQuery<GetTitleData>(GET_TITLE, {
    variables: { id },
    skip: !Number.isInteger(id),
  });

  const [updateTitle] = useMutation(UPDATE_TITLE, {
    refetchQueries: [{ query: GET_TITLE, variables: { id } }],
  });

  const [deleteTitle] = useMutation(DELETE_TITLE, {
    refetchQueries: [{ query: GET_TITLES }],
  });

  if (!Number.isInteger(id)) {
    return (
      <main className="min-h-screen py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-zinc-400">Invalid title ID.</p>
          <Link href="/" className="text-white underline mt-2 inline-block">Back to list</Link>
        </div>
      </main>
    );
  }

  if (loading && !data?.title) {
    return (
      <main className="min-h-screen py-10 px-4">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
        </div>
      </main>
    );
  }

  if (error || !data?.title) {
    return (
      <main className="min-h-screen py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-red-400">{error?.message ?? "Title not found."}</p>
          <Link href="/" className="text-white underline mt-2 inline-block">Back to list</Link>
        </div>
      </main>
    );
  }

  const title = data.title;

  async function handleUpdate(input: UpdateTitleInput) {
    await updateTitle({ variables: { id, input } });
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this title? This cannot be undone.")) return;
    await deleteTitle({ variables: { id } });
    router.replace("/");
    router.refresh();
  }

  if (editing) {
    return (
      <main className="min-h-screen py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <Link href={`/titles/${id}`} className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
            ← Back to title
          </Link>
          <h2 className="text-xl font-semibold text-white mb-6">Edit title</h2>
          <TitleForm
            title={title}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={handleUpdate}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
          ← Back to list
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
                title.type === "movie" ? "bg-amber-500/20 text-amber-400" : "bg-violet-500/20 text-violet-400"
              }`}
            >
              {title.type === "movie" ? "Movie" : "TV Show"}
            </span>
            <h1 className="text-3xl font-bold text-white">{title.name}</h1>
            <p className="text-zinc-500 mt-1">
              {title.type === "movie" ? title.year : `${title.year}${title.yearEnd ? ` – ${title.yearEnd}` : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-zinc-600 text-zinc-300 py-2 px-4 hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-500/50 text-red-400 py-2 px-4 hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
        {title.posterUrl && (
          <img
            src={title.posterUrl}
            alt={title.name}
            className="rounded-lg max-h-80 object-cover mb-6"
          />
        )}
        {title.description && (
          <p className="text-zinc-300 mb-6 max-w-2xl">{title.description}</p>
        )}
        {title.cast && title.cast.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 mb-2">Cast</h3>
            <p className="text-zinc-400">{title.cast.join(", ")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
