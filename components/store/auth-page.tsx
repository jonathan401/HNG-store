import Link from "next/link";

export const authFieldClass =
  "h-11 rounded-none border-store-mist bg-store-sand text-store-ink shadow-none placeholder:text-store-ink/40 focus-visible:ring-store-moss";

export const authSubmitClass =
  "inline-flex h-11 w-full items-center justify-center bg-store-moss text-sm text-store-sand transition-colors hover:bg-store-ink disabled:opacity-50";

export function AuthPage({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="max-w-md">
        <p className="text-xs uppercase tracking-[0.18em] text-store-clay">Your account</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95]">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-store-ink/80">{copy}</p>
        <Link href="/shop" className="mt-6 inline-block text-sm underline underline-offset-4">
          Back to the shop
        </Link>
      </div>
      <div className="border border-store-mist bg-store-paper p-6 sm:p-8">{children}</div>
    </div>
  );
}
