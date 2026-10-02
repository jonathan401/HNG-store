import Link from "next/link";

export const metadata = {
  title: "Check your email · HNG Store",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.18em] text-store-clay">Your account</p>
      <h1 className="mt-3 font-display text-5xl">Check your email</h1>
      <p className="mt-4 text-sm leading-relaxed text-store-ink/70">
        The account is created. Confirm it from the email before you sign in.
      </p>
      <Link href="/auth/login" className="mt-8 inline-block text-sm underline underline-offset-4">
        Back to sign in
      </Link>
    </div>
  );
}
