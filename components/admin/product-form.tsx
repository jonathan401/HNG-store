"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProduct } from "@/utils/actions/admin.action";
import type { DbProduct } from "@/lib/dal/types";

const fieldClass =
  "h-11 w-full rounded-none border border-store-mist bg-store-paper px-3 text-sm text-store-ink shadow-none outline-none ring-store-moss focus:ring-1";

export function ProductForm({ product }: { product?: DbProduct }) {
  const [state, action, pending] = useActionState(saveProduct, null);

  return (
    <form action={action} className="mt-8 grid max-w-xl gap-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label className="grid gap-2 text-sm">
        Name
        <input name="name" required defaultValue={product?.name ?? ""} className={fieldClass} />
      </label>
      <label className="grid gap-2 text-sm">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-none border border-store-mist bg-store-paper px-3 py-2 text-sm outline-none ring-store-moss focus:ring-1"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Price (NGN)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product ? Number(product.price) : ""}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Stock
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Category
        <input name="category" defaultValue={product?.category ?? ""} className={fieldClass} />
      </label>
      <ImageFields currentUrl={product?.image_url ?? ""} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
        Visible in the shop
      </label>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 bg-store-moss px-6 text-sm text-store-sand hover:bg-store-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}

function ImageFields({ currentUrl }: { currentUrl: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const shown = preview || currentUrl;

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm">
        Image URL
        <input name="image_url" defaultValue={currentUrl} className={fieldClass} />
      </label>
      <label className="grid gap-2 text-sm">
        Or upload from your device
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm file:mr-3 file:border-0 file:bg-store-mist file:px-3 file:py-2 file:text-sm file:text-store-ink"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (previewRef.current) URL.revokeObjectURL(previewRef.current);
            const next = file ? URL.createObjectURL(file) : null;
            previewRef.current = next;
            setFileName(file?.name ?? "");
            setPreview(next);
          }}
        />
      </label>
      {fileName ? (
        <p className="text-xs text-store-ink/60">
          {fileName} will be stored in the product images bucket. It replaces the URL above.
        </p>
      ) : null}
      {shown ? (
        <div className="relative h-40 w-40 overflow-hidden bg-store-mist">
          {/* Preview can be a local blob or any catalog URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}
