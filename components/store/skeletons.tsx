import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-store-mist", className)} />;
}

export function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">Loading orders</span>
      <Bone className="h-3 w-16" />
      <Bone className="mt-3 h-12 w-56" />
      <Bone className="mt-4 h-4 w-full max-w-md" />
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Bone key={index} className="h-9 w-20" />
        ))}
      </div>
      <div className="mt-6 divide-y divide-store-mist border-y border-store-mist">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-6 py-5">
            <div className="space-y-2">
              <Bone className="h-4 w-40" />
              <Bone className="h-3 w-64 max-w-full" />
            </div>
            <Bone className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">Loading order</span>
      <Bone className="h-4 w-20" />
      <Bone className="mt-6 h-3 w-16" />
      <Bone className="mt-3 h-10 w-64" />
      <Bone className="mt-4 h-4 w-40" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Bone key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
      <span className="sr-only">Loading products</span>
      {Array.from({ length: count }).map((_, index) => (
        <Bone key={index} className="aspect-[4/5]" />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16" aria-busy="true">
      <span className="sr-only">Loading product</span>
      <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-12">
        <Bone className="aspect-square" />
        <div>
          <Bone className="h-3 w-20" />
          <Bone className="mt-3 h-10 w-3/4" />
          <Bone className="mt-4 h-8 w-28" />
          <Bone className="mt-4 h-20 w-full" />
          <Bone className="mt-8 h-11 w-40" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">Loading checkout</span>
      <div className="mx-auto flex max-w-lg justify-center gap-4">
        <Bone className="h-9 w-24" />
        <Bone className="h-9 w-24" />
        <Bone className="h-9 w-28" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 border border-store-mist p-5">
          <Bone className="h-8 w-32" />
          <Bone className="h-11 w-full" />
          <Bone className="h-11 w-full" />
          <Bone className="h-11 w-full" />
        </div>
        <div className="space-y-4 border border-store-mist p-5">
          <Bone className="h-8 w-40" />
          <div className="flex gap-3">
            <Bone className="size-16 shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-16" />
              <Bone className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading the shop</span>
      <Bone className="h-[60vh] min-h-[420px] md:h-[80vh]" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading the desk</span>
      <Bone className="h-12 w-48" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Bone key={index} className="h-28" />
        ))}
      </div>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading</span>
      <Bone className="h-12 w-48" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Bone key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
