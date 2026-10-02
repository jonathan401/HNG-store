# HNG Store

HNG Store is a small shop for everyday goods, priced in naira and based in Lagos. Shoppers browse the catalog, keep a bag, and place orders. Staff with an admin profile manage products and fulfillment.

The storefront is public. Signing in is required to place an order, view order history, or open the admin area.

## Shoppers

- Browse the home page, shop, and product pages, and filter by category.
- Keep a bag in a drawer or on the cart page. A guest bag stays in the browser. A signed-in bag is saved to the account.
- Check out with a Nigerian city, a delivery address, and a payment choice: pay on delivery, Paystack, Flutterwave, or Stripe.
- Delivery is free on orders over ₦50,000. Smaller orders include a ₦3,500 fee. Payment is recorded when the order is placed and confirmed afterward.
- Create an account, sign in (including with Google), and reset a password.
- Review past orders from the account page.

## Admins

Admin access is a `profiles` row whose `role` is `admin`.

- Create, edit, and remove products, including photos stored in Supabase Storage.
- Review every order and update order status (`pending`, `paid`, `completed`, `cancelled`) and payment status.

Product and order writes that bypass row-level security use the Supabase service role key. Without it, the admin screens stay read-only.

## Stack

- Next.js and React, with TypeScript
- Tailwind CSS for the store layout
- Supabase for auth, Postgres, and product images
- Zustand for the client cart

Server actions in `utils/actions` sit in front of the data access in `lib/dal`. Store-only helpers (prices, delivery, Nigerian cities, cart state) live in `lib/store`.

## Routes

| Path | Who |
| --- | --- |
| `/`, `/shop`, `/products/[id]`, `/about`, `/contact` | Anyone |
| `/cart`, `/checkout` | Anyone; placing an order requires sign-in |
| `/auth/login`, `/auth/sign-up` | Anyone |
| `/account/orders` | Signed-in shoppers |
| `/admin` | Admins |

## Run locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app expects these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed for admin product writes, image uploads, and order updates. The database is the linked Supabase project: `products`, `cart_items`, `orders`, `order_items`, `payments`, and `profiles`, plus a public `product-images` bucket.

Other scripts:

```bash
npm run build
npm run start
npm run lint
```
