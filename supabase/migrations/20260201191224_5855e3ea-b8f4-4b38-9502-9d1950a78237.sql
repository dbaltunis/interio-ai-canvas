-- Restore surfaces for project 113a5360-eb1a-42bc-bff0-909821b9305b
-- These were accidentally deleted by a race condition in the auto-cleanup logic

INSERT INTO surfaces (id, name, project_id, room_id, surface_type, user_id)
VALUES
  -- Room 1 (6ba3a29a-e702-4bc0-9a5e-c50a9904733c) - Windows 1, 2, 4
  ('f1487737-0b86-4abf-addf-010b85618a43', 'Window 1', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('60146948-e2a0-41f3-8924-813fb029da15', 'Window 2', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('06bf0dad-0bab-4903-ba14-e545b62165a3', 'Window 4', '113a5360-eb1a-42bc-bff0-909821b9305b', '6ba3a29a-e702-4bc0-9a5e-c50a9904733c', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  -- Room 2 (7ffc152a-1c67-4e7c-b4c7-8900bd2cd144) - Windows 1, 2
  ('bed9ea8d-748d-4843-9a46-ce2b22fc3595', 'Window 1', '113a5360-eb1a-42bc-bff0-909821b9305b', '7ffc152a-1c67-4e7c-b4c7-8900bd2cd144', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26'),
  ('cc4e1efc-732a-43e1-bedc-22ab191be750', 'Window 2', '113a5360-eb1a-42bc-bff0-909821b9305b', '7ffc152a-1c67-4e7c-b4c7-8900bd2cd144', 'window', 'b0c727dd-b9bf-4470-840d-1f630e8f2b26')
ON CONFLICT (id) DO NOTHING;