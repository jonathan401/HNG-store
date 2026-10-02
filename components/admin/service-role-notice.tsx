export function ServiceRoleNotice() {
  return (
    <p className="max-w-lg text-sm leading-relaxed text-store-ink/70">
      Add SUPABASE_SERVICE_ROLE_KEY to the server environment. Catalog, order, and payment
      changes run with the service role, because those tables only let shoppers read and create
      their own rows.
    </p>
  );
}
