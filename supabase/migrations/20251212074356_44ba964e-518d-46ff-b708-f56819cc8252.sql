
-- Update fixed bugs to closed status
UPDATE bug_reports 
SET status = 'closed', resolved_at = now(), resolution_notes = 'Fixed and verified'
WHERE id IN (
  '07e20474-101f-42b3-acd9-45f9bcbc0583',
  '5d491d42-5dea-4159-bc5c-b7c3ae9b5b0b',
  '00a4b30d-93e4-451b-8577-6cc8923a99c6',
  '3c4dc5fc-113f-451b-9dbe-f2d947c6137b'
);
