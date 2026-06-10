import Link from "next/link";
import { Mark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Mark className="h-12 w-12 text-white" />
      <h1 className="text-4xl font-medium tracking-tight">
        404 — this page is not part of the story
      </h1>
      <p className="max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist. Maybe the agent
        moved it.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85"
      >
        Back to onfable.xyz
      </Link>
    </main>
  );
}
