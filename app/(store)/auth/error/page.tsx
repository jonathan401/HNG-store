import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Something went wrong · HNG Store",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <p className="mt-4 text-sm leading-relaxed text-store-ink/70">
      {params?.error ? params.error : "An unspecified error occurred."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">Your account</p>
      <h1 className="mt-3 font-display text-5xl">Something went wrong</h1>
      <Suspense>
        <ErrorContent searchParams={searchParams} />
      </Suspense>
      <Link href="/auth/login" className="mt-8 inline-block text-sm underline underline-offset-4">
        Back to sign in
      </Link>
    </div>
  );
}
