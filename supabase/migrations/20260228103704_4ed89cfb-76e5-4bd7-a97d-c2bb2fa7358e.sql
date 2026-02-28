
-- Convert text price_range values to numeric price_value for items missing price_value
-- Parse Indian number format: ₹1,20,000/day → 120000

-- Per Day items
UPDATE public.rentals SET price_value = 8000, pricing_unit = 'Per Day' WHERE id = '4ad18fc0-c62e-4128-87ec-6a75c7e027f0' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 4500, pricing_unit = 'Per Day' WHERE id = '71599d99-145f-4771-a8c6-578eeb0fa7f5' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 10000, pricing_unit = 'Per Day' WHERE id = '2e61b8da-676f-473f-aa23-7096ea4d4ba9' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 20000, pricing_unit = 'Per Day' WHERE id = '0da4cd06-a5d9-4f5a-82cc-0e42fd332581' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 45000, pricing_unit = 'Per Day' WHERE id = '305fc898-2607-43f0-9a4f-d207dbea0d91' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 12000, pricing_unit = 'Per Day' WHERE id = '0ef85574-ceca-46b9-9bdd-9aeaf7318856' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 120000, pricing_unit = 'Per Day' WHERE id = '1826083b-5676-4861-bce4-a3efe56c47eb' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 25000, pricing_unit = 'Per Day' WHERE id = '9e8c7e8b-d399-4797-9b53-3c324df612b5' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 2500, pricing_unit = 'Per Day' WHERE id = '9b6216e9-4285-48a2-82c0-1251b2ebb17b' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 2500, pricing_unit = 'Per Day' WHERE id = 'dc31a9f7-be48-4a98-9b2d-32a780e3de0b' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 150, pricing_unit = 'Per Day' WHERE id = 'f0ca1e36-3769-4506-bd94-29cdf8195304' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 3500, pricing_unit = 'Per Day' WHERE id = 'ec4f4481-fa80-46d0-acec-0a1499bb2c3e' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 1500, pricing_unit = 'Per Day' WHERE id = 'bbcc3aa7-2a7b-4b31-87d7-53c40d1d1d03' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 5000, pricing_unit = 'Per Day' WHERE id = '643e07dc-7d02-4c7c-849d-7a9dc21d0df5' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 25000, pricing_unit = 'Per Day' WHERE id = '8cbc0212-c02b-419e-83d1-4e022523d6d7' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 3000, pricing_unit = 'Per Day' WHERE id = '13522c86-0f50-415a-a4d2-20378d9248ba' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 15000, pricing_unit = 'Per Day' WHERE id = '07228a40-3d70-491f-958e-ab1e4c06b6ec' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 6500, pricing_unit = 'Per Day' WHERE id = 'c029a328-f57e-4311-ad01-445919f3d580' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 45000, pricing_unit = 'Per Day' WHERE id = 'e786bb94-f328-48fe-ac0c-1fc819e36664' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 25000, pricing_unit = 'Per Day' WHERE id = '29059cc6-a0dd-4c45-9fce-4d482df3578e' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 35000, pricing_unit = 'Per Day' WHERE id = '1e41d600-b2ec-4231-a17a-4c24036aec14' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 1500, pricing_unit = 'Per Day' WHERE id = '6a2e380a-fe30-44c4-b7b4-724fd18f51dd' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 1200, pricing_unit = 'Per Day' WHERE id = '4acf45cf-d7d3-46e6-ba86-2f0c3c46848b' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 800, pricing_unit = 'Per Day' WHERE id = '54f800a3-61ae-4fee-901a-b6daf459702c' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 150000, pricing_unit = 'Per Day' WHERE id = '37e3f67f-6175-43d7-9ea2-f80e4754089b' AND price_value IS NULL;

-- Per Sq.Ft items
UPDATE public.rentals SET price_value = 10, pricing_unit = 'Per Sq.Ft' WHERE id = '97574a3b-7e2e-4e13-bd8f-b5c6d462ab51' AND price_value IS NULL;
UPDATE public.rentals SET price_value = 15, pricing_unit = 'Per Sq.Ft' WHERE id = '6f14b0ea-81be-43fc-a130-92561e1d9f77' AND price_value IS NULL;

-- Per Trip
UPDATE public.rentals SET price_value = 5000, pricing_unit = 'Per Trip' WHERE id = '66b28c8c-7ddb-4ef7-b540-76b9e386fc37' AND price_value IS NULL;

-- Per Unit
UPDATE public.rentals SET price_value = 12000, pricing_unit = 'Per Unit' WHERE id = '3221b4d4-a740-4d75-96e6-e9a660d31f7b' AND price_value IS NULL;
