--
-- PostgreSQL database dump
--

\restrict hTed0zEX5iZlRjdHxIk1qSXECg0RkWYKrCE1i2OrHK7MeQQbFQu6lIkDeyqQr7t

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: store_locale; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) VALUES ('stloc_2daab8b142680df1bae3df045d4d69da', 'en-US', 'store_01KJZ4WWFQ2GGYTTF7ZZWTZYYR', '2026-03-05 14:11:04.132321+00', '2026-03-05 14:11:04.132321+00', NULL);
INSERT INTO public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) VALUES ('stloc_37da5bdf903d506d641dfdf340199593', 'ko-KR', 'store_01KJZ4WWFQ2GGYTTF7ZZWTZYYR', '2026-03-05 14:11:04.132321+00', '2026-03-05 14:11:04.132321+00', NULL);
INSERT INTO public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) VALUES ('stloc_6f7079bdba3594d5c87a8b00cd3d61c9', 'zh-CN', 'store_01KJZ4WWFQ2GGYTTF7ZZWTZYYR', '2026-03-05 14:11:04.132321+00', '2026-03-05 14:11:04.132321+00', NULL);
INSERT INTO public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) VALUES ('stloc_d84d954ffc664b681b29681ef698bb0c', 'ja-JP', 'store_01KJZ4WWFQ2GGYTTF7ZZWTZYYR', '2026-03-05 14:11:04.132321+00', '2026-03-05 14:11:04.132321+00', NULL);


--
-- Data for Name: translation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_6313eb8a8711bb4e8c2c5cb3ea596b50', 'prod_01KJZ4WWKQ9KXSMSBRH9Z1SY5D', 'product', 'ko-KR', '{"title": "메두사 스웨트셔츠", "material": "", "subtitle": "", "description": "클래식 스웨트셔츠의 느낌을 새롭게 정의해 보세요. 저희 면 스웨트셔츠와 함께라면 일상 필수품도 더 이상 평범할 필요가 없습니다."}', '2026-03-05 14:03:09.01013+00', '2026-03-05 14:11:04.132321+00', NULL, 2);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KJZ58YNC3WGTGM5FKZDHB3JC', 'prod_01KJZ4WWKQ9KXSMSBRH9Z1SY5D', 'product', 'zh-CN', '{"title": "美杜莎卫衣", "material": "", "subtitle": "", "description": "重新定义经典卫衣的穿着感受。我们的纯棉卫衣，让日常必备单品不再平庸。"}', '2026-03-05 14:08:53.42+00', '2026-03-05 14:11:04.132321+00', NULL, 2);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KJZ59WXZEPNN4A7H7AH967ZT', 'prod_01KJZ4WWKQ9KXSMSBRH9Z1SY5D', 'product', 'ja-JP', '{"title": "メデューサ スウェットシャツ", "material": "", "subtitle": "", "description": "クラシックなスウェットシャツの着心地を、もう一度実感してください。コットンスウェットシャツがあれば、毎日の必需品が、もはやありきたりなものではなくなります。"}', '2026-03-05 14:09:24.415+00', '2026-03-05 14:11:04.132321+00', NULL, 2);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KK1AV41QZD6WX0VNJJAAEYZ8', 'reg_01KK18XMMY7RSDF1Y9DY71FFJA', 'region', 'ko-KR', '{"name": "아시아"}', '2026-03-06 10:24:40.503+00', '2026-03-06 10:24:40.503+00', NULL, 1);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KK1AW3CWN4Y3322V8JVA1NYQ', 'so_01KK1A2ZZBXKHZ4NX53QT6GBW5', 'shipping_option', 'ko-KR', '{"name": "일반"}', '2026-03-06 10:25:12.605+00', '2026-03-06 10:25:12.605+00', NULL, 1);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KK1AW3CWF3BWW4VVYN8XPS82', 'so_01KK1A42562YEQWZ7H4141P4PZ', 'shipping_option', 'ko-KR', '{"name": "도서, 산간"}', '2026-03-06 10:25:12.605+00', '2026-03-06 10:25:12.605+00', NULL, 1);
INSERT INTO public.translation (id, reference_id, reference, locale_code, translations, created_at, updated_at, deleted_at, translated_field_count) VALUES ('trans_01KK1AW3CWPFC8E9EBVSF7K4SC', 'so_01KK1A5G3H3KKB52GPR90KJ843', 'shipping_option', 'ko-KR', '{"name": "당일 발송 (도서, 산간 제외)"}', '2026-03-06 10:25:12.605+00', '2026-03-06 10:25:12.605+00', NULL, 1);


--
-- PostgreSQL database dump complete
--

\unrestrict hTed0zEX5iZlRjdHxIk1qSXECg0RkWYKrCE1i2OrHK7MeQQbFQu6lIkDeyqQr7t

