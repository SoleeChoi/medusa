-- Dev bootstrap script (ID-agnostic).
-- Safe to run multiple times after seed/migrations.

BEGIN;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 1) Ensure store supports these locales.
WITH target_store AS (
  SELECT id
  FROM public.store
  ORDER BY created_at ASC
  LIMIT 1
)
DELETE FROM public.store_locale sl
USING target_store ts
WHERE sl.store_id = ts.id
  AND sl.locale_code IN ('en-US', 'ko-KR', 'zh-CN', 'ja-JP');

WITH target_store AS (
  SELECT id
  FROM public.store
  ORDER BY created_at ASC
  LIMIT 1
),
target_locales(locale_code) AS (
  VALUES ('en-US'), ('ko-KR'), ('zh-CN'), ('ja-JP')
)
INSERT INTO public.store_locale (
  id, locale_code, store_id, created_at, updated_at, deleted_at
)
SELECT
  'stloc_' || md5(random()::text || clock_timestamp()::text),
  tl.locale_code,
  ts.id,
  now(),
  now(),
  NULL
FROM target_store ts
CROSS JOIN target_locales tl;

-- 2) Upsert translations by stable product handle.
WITH target_translations(locale_code, translations, translated_field_count) AS (
  VALUES
    ('ko-KR', '{"title": "메두사 스웨트셔츠", "material": "", "subtitle": "", "description": "클래식 스웨트셔츠의 느낌을 새롭게 정의해 보세요. 저희 면 스웨트셔츠와 함께라면 일상 필수품도 더 이상 평범할 필요가 없습니다."}'::jsonb, 2),
    ('zh-CN', '{"title": "美杜莎卫衣", "material": "", "subtitle": "", "description": "重新定义经典卫衣的穿着感受。我们的纯棉卫衣，让日常必备单品不再平庸。"}'::jsonb, 2),
    ('ja-JP', '{"title": "メデューサ スウェットシャツ", "material": "", "subtitle": "", "description": "クラシックなスウェットシャツの着心地を、もう一度実感してください。コットンスウェットシャツがあれば、毎日の必需品が、もはやありきたりなものではなくなります。"}'::jsonb, 2)
)
INSERT INTO public.translation (
  id,
  reference_id,
  reference,
  locale_code,
  translations,
  created_at,
  updated_at,
  deleted_at,
  translated_field_count
)
SELECT
  'trans_' || md5(random()::text || clock_timestamp()::text),
  p.id,
  'product',
  tt.locale_code,
  tt.translations,
  now(),
  now(),
  NULL,
  tt.translated_field_count
FROM public.product p
JOIN target_translations tt ON TRUE
WHERE p.handle = 'sweatshirt'
ON CONFLICT (reference_id, locale_code) WHERE deleted_at IS NULL
DO UPDATE SET
  translations = EXCLUDED.translations,
  translated_field_count = EXCLUDED.translated_field_count,
  updated_at = now(),
  deleted_at = NULL;

COMMIT;

