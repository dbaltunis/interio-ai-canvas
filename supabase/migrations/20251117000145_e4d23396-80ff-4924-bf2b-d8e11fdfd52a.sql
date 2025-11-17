-- Add RLS policies for inventory_transactions and project_material_allocations

-- Policies for inventory_transactions
CREATE POLICY "Account isolation - SELECT" ON public.inventory_transactions
  FOR SELECT
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - INSERT" ON public.inventory_transactions
  FOR INSERT
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - UPDATE" ON public.inventory_transactions
  FOR UPDATE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  )
  WITH CHECK (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

CREATE POLICY "Account isolation - DELETE" ON public.inventory_transactions
  FOR DELETE
  USING (
    get_effective_account_owner(auth.uid()) = get_effective_account_owner(user_id)
  );

-- Policies for project_material_allocations (using project ownership)
CREATE POLICY "Account isolation - SELECT" ON public.project_material_allocations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_material_allocations.project_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(p.user_id)
    )
  );

CREATE POLICY "Account isolation - INSERT" ON public.project_material_allocations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_material_allocations.project_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(p.user_id)
    )
  );

CREATE POLICY "Account isolation - UPDATE" ON public.project_material_allocations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_material_allocations.project_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(p.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_material_allocations.project_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(p.user_id)
    )
  );

CREATE POLICY "Account isolation - DELETE" ON public.project_material_allocations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_material_allocations.project_id
        AND get_effective_account_owner(auth.uid()) = get_effective_account_owner(p.user_id)
    )
  );