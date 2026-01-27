-- Insert Option Values for all 5 treatment options

-- Slat Width Values (option_id: c72f6d5e-1369-4e15-be1c-f7bd3bfe55cc)
INSERT INTO option_values (option_id, code, label, order_index, extra_data, account_id)
VALUES
  ('c72f6d5e-1369-4e15-be1c-f7bd3bfe55cc', '25_iso', '25 mm ISO', 1, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('c72f6d5e-1369-4e15-be1c-f7bd3bfe55cc', '25_timberlux', '25 mm Timberlux', 2, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('c72f6d5e-1369-4e15-be1c-f7bd3bfe55cc', '50_timberlux', '50 mm Timberlux', 3, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5');

-- Mechanism Type Values (option_id: bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38)
INSERT INTO option_values (option_id, code, label, order_index, extra_data, account_id)
VALUES
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'vartymo_rankinis', 'Vartymo mechanizmas (rankinis)', 1, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'pakelimo_rankinis', 'Pakėlimo mechanizmas (rankinis)', 2, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'valdymo_pusiu', 'Valdymo pusių pasirinkimas (K/D)', 3, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'somfy_rts', 'Automatinis - Somfy RTS', 4, '{"price": 185, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'somfy_wt', 'Automatinis - Somfy WT (laidinis)', 5, '{"price": 165, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'tilt_only', 'Tilt only mechanizmas', 6, '{"price": 45, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'nukreipimo_trosai', 'Nukreipiamieji trosai', 7, '{"price": 25, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'apatinio_fiksacija', 'Apatinio profilio fiksacija', 8, '{"price": 15, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('bcdbbb33-9f00-4ebc-8ad8-ed03560e6c38', 'saugus_vaikas', 'Saugus vaikas sistema', 9, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5');

-- Finish Type Values (option_id: 1de29699-a98d-4fd0-91ab-164b4d261089)
INSERT INTO option_values (option_id, code, label, order_index, extra_data, account_id)
VALUES
  ('1de29699-a98d-4fd0-91ab-164b4d261089', 'tiesi_at', 'Tiesi – AT (be užlenkimų)', 1, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('1de29699-a98d-4fd0-91ab-164b4d261089', 'vienas_ak', 'Su užlenkimu – AK (kairėje)', 2, '{"price": 8, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('1de29699-a98d-4fd0-91ab-164b4d261089', 'vienas_ad', 'Su užlenkimu – AD (dešinėje)', 3, '{"price": 8, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('1de29699-a98d-4fd0-91ab-164b4d261089', 'du_akd', 'Su dviem – AKD (abu šonai)', 4, '{"price": 15, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5');

-- Cord Type Values (option_id: 119aed18-80f2-4dd2-9dea-5dab94db5420)
INSERT INTO option_values (option_id, code, label, order_index, extra_data, account_id)
VALUES
  ('119aed18-80f2-4dd2-9dea-5dab94db5420', 'virvelines', 'Virvelinės (standartinės)', 1, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('119aed18-80f2-4dd2-9dea-5dab94db5420', 'juostines_10', 'Juostinės 10mm', 2, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('119aed18-80f2-4dd2-9dea-5dab94db5420', 'juostines_25', 'Juostinės 25mm', 3, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('119aed18-80f2-4dd2-9dea-5dab94db5420', 'juostines_38', 'Juostinės 38mm (tik 50mm)', 4, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5');

-- Cord Tips Values (option_id: 02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3)
INSERT INTO option_values (option_id, code, label, order_index, extra_data, account_id)
VALUES
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'mediniai', 'Mediniai (standartiniai)', 1, '{"price": 0, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_auksas', 'Metaliniai - Auksas', 2, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_varis', 'Metaliniai - Varis', 3, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_chromas', 'Metaliniai - Chromas', 4, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_antracitas', 'Metaliniai - Antracitas', 5, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_juoda', 'Metaliniai - Juoda', 6, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_aliuminis', 'Metaliniai - Šlifuotas aliuminis', 7, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5'),
  ('02343fc1-a7aa-4c92-9b8f-e62fd30e1dd3', 'metaliniai_balta', 'Metaliniai - Matinė balta', 8, '{"price": 12, "pricing_method": "per-unit"}', '32a92783-f482-4e3d-8ebf-c292200674e5');