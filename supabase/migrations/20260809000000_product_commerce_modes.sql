-- Product commerce modes: keep digital-first behavior while making physical and hybrid offers explicit.
alter table public.products
  add column if not exists product_mode text not null default 'digital',
  add column if not exists sku text,
  add column if not exists inventory_quantity integer,
  add column if not exists shipping_notes text;

alter table public.products
  drop constraint if exists products_product_mode_check;

alter table public.products
  add constraint products_product_mode_check
  check (product_mode in ('digital', 'physical', 'hybrid'));

create index if not exists products_product_mode_idx on public.products(product_mode);
