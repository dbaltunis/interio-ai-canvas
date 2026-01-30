-- Fix mislinked collections: reassign 111 collections to correct TWC vendor
-- These collections belong to user ec930f73... but are linked to vendor 93608e2c... 
-- owned by a different user (504dcfd2...), causing RLS to block vendor lookup

UPDATE collections
SET vendor_id = 'c956c497-153a-4c1e-9df9-314110943351'
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d'
  AND vendor_id = '93608e2c-0048-4d6c-bf29-928137fb027e'
  AND active = true;