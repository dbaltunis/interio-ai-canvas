
-- Add room_id and window_covering_id to client_measurements table
ALTER TABLE client_measurements 
ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
ADD COLUMN window_covering_id TEXT;

-- Create index for better query performance
CREATE INDEX idx_client_measurements_room_id ON client_measurements(room_id);
CREATE INDEX idx_client_measurements_window_covering_id ON client_measurements(window_covering_id);
