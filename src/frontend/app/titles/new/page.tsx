"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import {
  CREATE_TITLE,
  GET_TITLES,
  type CreateTitleInput,
} from "@/lib/graphql/titles";
import { TitleForm } from "@/components/TitleForm";

export default function NewTitlePage() {
  const router = useRouter();
  const [createTitle] = useMutation(CREATE_TITLE, {
    refetchQueries: [{ query: GET_TITLES }],
  });

  async function handleCreate(input: CreateTitleInput) {
    const res = await createTitle({ variables: { input } });
    const id = res.data?.createTitle?.id;
    if (id) {
      router.replace(`/titles/${id}`);
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Back to list
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Add title</h1>
        <TitleForm submitLabel="Create title" onSubmit={handleCreate as any} />
      </div>
    </main>
  );
}
