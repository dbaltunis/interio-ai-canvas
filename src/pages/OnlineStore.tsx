import { OnlineStoreTab } from "@/components/online-store/OnlineStoreTab";
import { FeatureGate } from "@/components/subscription/FeatureGate";

export default function OnlineStore() {
  return (
    <FeatureGate
      feature="online_store"
      showUpgradePrompt={true}
    >
      <OnlineStoreTab />
    </FeatureGate>
  );
}
