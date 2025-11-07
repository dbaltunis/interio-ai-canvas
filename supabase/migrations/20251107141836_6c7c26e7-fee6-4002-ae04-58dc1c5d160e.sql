-- Fix the copy_job_statuses function to handle foreign key constraints
CREATE OR REPLACE FUNCTION public.copy_job_statuses_to_team_member(
    team_member_id uuid,
    owner_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    status_record record;
    statuses_copied int := 0;
    existing_status_id uuid;
BEGIN
    RAISE LOG 'copy_job_statuses_to_team_member: Copying statuses from % to %', owner_id, team_member_id;
    
    -- Instead of deleting, update existing statuses or insert new ones
    FOR status_record IN 
        SELECT * FROM public.job_statuses 
        WHERE user_id = owner_id 
        AND is_active = true
        ORDER BY slot_number
    LOOP
        -- Check if a status with the same slot_number exists
        SELECT id INTO existing_status_id
        FROM public.job_statuses
        WHERE user_id = team_member_id
        AND slot_number = status_record.slot_number
        LIMIT 1;
        
        IF existing_status_id IS NOT NULL THEN
            -- Update existing status
            UPDATE public.job_statuses
            SET
                name = status_record.name,
                color = status_record.color,
                action = status_record.action,
                is_active = true
            WHERE id = existing_status_id;
        ELSE
            -- Insert new status
            INSERT INTO public.job_statuses (
                user_id,
                name,
                color,
                action,
                slot_number,
                is_active,
                created_at
            ) VALUES (
                team_member_id,
                status_record.name,
                status_record.color,
                status_record.action,
                status_record.slot_number,
                true,
                NOW()
            );
        END IF;
        
        statuses_copied := statuses_copied + 1;
    END LOOP;
    
    -- Mark any extra statuses as inactive (don't delete due to FK constraints)
    UPDATE public.job_statuses
    SET is_active = false
    WHERE user_id = team_member_id
    AND slot_number NOT IN (
        SELECT slot_number FROM public.job_statuses 
        WHERE user_id = owner_id AND is_active = true
    )
    AND is_active = true;
    
    RAISE LOG 'copy_job_statuses_to_team_member: Synced % statuses', statuses_copied;
    
    RETURN jsonb_build_object(
        'success', true,
        'team_member_id', team_member_id,
        'owner_id', owner_id,
        'statuses_synced', statuses_copied
    );
END;
$$;