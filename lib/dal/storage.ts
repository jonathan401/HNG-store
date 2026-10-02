import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const PRODUCT_IMAGE_BUCKET = "product-images";

const MAX_BYTES = 5 * 1024 * 1024;

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadProductImage(file: File) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return { error: "Missing SUPABASE_SERVICE_ROLE_KEY." };

  const extension = extensions[file.type];
  if (!extension) return { error: "Use a JPEG, PNG, WebP, or GIF." };
  if (file.size > MAX_BYTES) return { error: "Images have to be 5 MB or smaller." };

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) return { error: listError.message };

  const existing = buckets?.find((bucket) => bucket.name === PRODUCT_IMAGE_BUCKET);
  if (!existing) {
    const { error: createError } = await admin.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: Object.keys(extensions),
    });
    if (createError) return { error: createError.message };
  } else if (!existing.public) {
    const { error: updateError } = await admin.storage.updateBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
    });
    if (updateError) return { error: updateError.message };
  }

  const path = `${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
