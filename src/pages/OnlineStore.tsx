import { OnlineStoreTab } from "@/components/online-store/OnlineStoreTab";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function OnlineStore() {
  const { data: hasStore, isLoading } = useQuery({
    queryKey: ['online-store-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg" />;
  }

  // If user has an existing store, give them full access
  if (hasStore) {
    return <OnlineStoreTab />;
  }

  // If no store exists, use FeatureGate to control creation
  return (
    <FeatureGate
      feature="online_store"
      showUpgradePrompt={true}
    >
      <OnlineStoreTab />
    </FeatureGate>
  );
}
