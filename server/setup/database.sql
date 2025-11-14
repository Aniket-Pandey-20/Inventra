-- ===========================
-- PRODUCTS (root table)
-- username root
-- ===========================
CREATE TABLE IF NOT EXISTS public.products (
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT products_pkey PRIMARY KEY (product_id)
)
TABLESPACE pg_default;

ALTER TABLE public.products OWNER TO root;

-- ===========================
-- INVENTORY BATCHES (FK → products)
-- ===========================
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    batch_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    quantity_remaining INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT inventory_batches_pkey PRIMARY KEY (batch_id),
    CONSTRAINT inventory_batches_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES public.products(product_id)
)
TABLESPACE pg_default;

ALTER TABLE public.inventory_batches OWNER TO root;

CREATE INDEX IF NOT EXISTS idx_inventory_batches_product_time
    ON public.inventory_batches (
        product_id ASC NULLS LAST,
        purchased_at ASC NULLS LAST
    )
    WITH (fillfactor=100, deduplicate_items = TRUE)
    TABLESPACE pg_default;

-- ===========================
-- SALES (FK → products)
-- ===========================
CREATE TABLE IF NOT EXISTS public.sales (
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    cogs NUMERIC(12,2) NOT NULL,
    sold_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT sales_pkey PRIMARY KEY (sale_id),
    CONSTRAINT sales_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES public.products(product_id)
)
TABLESPACE pg_default;

ALTER TABLE public.sales OWNER TO root;

CREATE INDEX IF NOT EXISTS idx_sales_product_time
    ON public.sales (
        product_id ASC NULLS LAST,
        sold_at ASC NULLS LAST
    )
    WITH (fillfactor=100, deduplicate_items = TRUE)
    TABLESPACE pg_default;

-- ===========================
-- USERS (independent)
-- ===========================
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
TABLESPACE pg_default;

ALTER TABLE public.users OWNER TO root;


-- ===========================
-- Dummy Data
-- ===========================

INSERT INTO public.users (id, username, password, email, created_at, updated_at)
VALUES (
    1,
    'admin@example.com',
    '$2b$10$yw6zwy9jYJzEgY9V9hFHNublcvX/mQMoQBDSAl5hFZB0FAbnZ7yru',
    'admin@example.com',
    NOW(),
    NOW()
);

INSERT INTO public.products (product_id, name, description, created_at, updated_at)
VALUES 
    ('PROD-1001', 'Smartwatch', 'Bluetooth-enabled smartwatch with health tracking.', NOW(), NOW()),
    ('PROD-1002', 'Earbuds', 'Wireless earbuds with noise cancellation.', NOW(), NOW()),
    ('PROD-1003', 'Power Bank', '10,000mAh fast-charging power bank.', NOW(), NOW());
