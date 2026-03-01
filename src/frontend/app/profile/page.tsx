"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { setUser } from "@/lib/auth";
import {
  GET_ME,
  UPDATE_PROFILE,
  type GetMeData,
  type UpdateProfileInput,
} from "@/lib/graphql/profile";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const { data } = useQuery<GetMeData>(GET_ME);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  useEffect(() => {
    if (data?.me) {
      setDisplayName(data.me.displayName);
      setAvatarUrl(data.me.avatarUrl ?? "");
      setBio(data.me.bio ?? "");
    }
  }, [data?.me]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const input: UpdateProfileInput = {
      displayName: displayName.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      bio: bio.trim() || null,
    };
    const res = await updateProfile({ variables: { input } });
    const updated = res.data?.updateProfile;
    if (updated) {
      setUser({
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        createdAt: updated.createdAt,
      });
      setSaved(true);
    }
  }

  if (!data?.me) {
    return (
      <main className="min-h-screen py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-zinc-400">Loading profile…</p>
        </div>
      </main>
    );
  }

  const me = data.me;

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
        <div className="mb-6 text-zinc-400 text-sm">{me.email}</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {saved && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              Profile saved.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-100 text-zinc-900 font-medium py-2 px-4 hover:bg-white disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
