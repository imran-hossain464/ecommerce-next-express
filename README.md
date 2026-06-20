# Next.js + Express Ecommerce

A full-stack ecommerce starter with:

- Next.js App Router frontend
- Express backend API
- Supabase/Postgres database
- Tailwind CSS and shadcn-style UI components
- Storefront pages: shop, contact, cart, account, order status
- Product details pages at `/shop/[slug]`
- Customer registration and login through the Express API
- Admin panel for products, customers, and orders

## Project Structure

```txt
apps/
  api/      Express API connected to Supabase
  web/      Next.js frontend
supabase/
  schema.sql
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `apps/api/.env` from the example:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Create `apps/web/.env.local` from the example:

```bash
cp apps/web/.env.example apps/web/.env.local
```

4. Run `supabase/schema.sql` in your Supabase SQL editor.

If you already ran an older version of the schema and registration fails with a `400 Bad Request`, run:

```txt
supabase/fix-auth-schema.sql
```

This removes the old `profiles -> auth.users` dependency and adds the columns required for custom Express registration.

5. Start both apps:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000

## Supabase Env Configuration

Create a project at [supabase.com](https://supabase.com/), then open your project dashboard.

In Supabase, open **Project Settings > API Keys**:

- Copy the **Project URL** into both env files as `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`.
- For the backend, copy a **Secret key** into `apps/api/.env` as `SUPABASE_SECRET_KEY`.
- If your project only shows legacy keys, use `SUPABASE_SERVICE_ROLE_KEY` instead.
- For the frontend, copy a **Publishable key** into `apps/web/.env.local` as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- If your project only shows legacy keys, use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.

Example `apps/api/.env`:

```env
PORT=4000
WEB_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your-backend-secret-key
JWT_SECRET=make-this-long-random-and-private
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Example `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-public-key
```

Never put the backend secret key in `apps/web/.env.local`.

## Cloudinary Product Images

Create a Cloudinary account, then copy these values from the Cloudinary dashboard into `apps/api/.env`:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Admins can upload a product image file from `/admin`. The browser sends the image to the Express API, and the API uploads it to Cloudinary. Cloudinary credentials are never exposed to the frontend.

## Admin Access

Login and registration are handled by the Express API, not Supabase Auth. Supabase is used as the Postgres database.

Customer auth routes:

```txt
POST /auth/register
POST /auth/login
GET /auth/me
```

The API returns a JWT. Authenticated requests include:

```txt
Authorization: Bearer <app-jwt>
```

Admin-only routes require a matching row in `profiles` with `role = 'admin'`.

To create your first admin, register normally, then run this in Supabase SQL:

```sql
update profiles
set role = 'admin'
where email = 'your-email@example.com';
```

Then open `/admin/login` and sign in with that email/password.

## Customer Flow

- `/register`: create a customer account.
- `/login`: login and store the app JWT in a cookie.
- `/checkout`: allows guest orders. If the customer is logged in, the order is saved to their account history.
- After checkout, customers see a success popup with order details.
- `/orders/status`: customers can track orders using the checkout phone number.
- `/account`: requires login and shows profile plus order history.
