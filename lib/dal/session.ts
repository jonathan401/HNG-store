import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  role: string;
};

export async function getViewer(): Promise<Viewer | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? "",
      role: profile?.role ?? "customer",
    };
  } catch {
    return null;
  }
}
