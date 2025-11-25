
-- Allow users to manage their own hidden categories
CREATE POLICY "Users can manage their own hidden categories"
ON hidden_option_categories
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Delete the hidden system defaults for the current user
DELETE FROM hidden_option_categories
WHERE user_id = 'ec930f73-ef23-4430-921f-1b401859825d';
