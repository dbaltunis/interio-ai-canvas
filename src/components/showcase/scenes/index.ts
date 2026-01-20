export { AppOverviewScene } from "./AppOverviewScene";
export { TeamPermissionsScene } from "./TeamPermissionsScene";
export { ProductBuilderScene } from "./ProductBuilderScene";
export { ThemeColorsScene } from "./ThemeColorsScene";
export { MarkupPricingScene } from "./MarkupPricingScene";
export { QuoteCanvasScene } from "./QuoteCanvasScene";
export { IntegrationsScene } from "./IntegrationsScene";
export { CRMMessagingScene } from "./CRMMessagingScene";
export { LibraryCalendarScene } from "./LibraryCalendarScene";
export { FinalMontageScene } from "./FinalMontageScene";

export interface ShowcaseScene {
  id: string;
  component: React.ComponentType<{ progress: number }>;
  duration: number; // in seconds
  title: string;
  subtitle?: string;
}

import { AppOverviewScene } from "./AppOverviewScene";
import { TeamPermissionsScene } from "./TeamPermissionsScene";
import { ProductBuilderScene } from "./ProductBuilderScene";
import { ThemeColorsScene } from "./ThemeColorsScene";
import { MarkupPricingScene } from "./MarkupPricingScene";
import { QuoteCanvasScene } from "./QuoteCanvasScene";
import { IntegrationsScene } from "./IntegrationsScene";
import { CRMMessagingScene } from "./CRMMessagingScene";
import { LibraryCalendarScene } from "./LibraryCalendarScene";
import { FinalMontageScene } from "./FinalMontageScene";

export const showcaseScenes: ShowcaseScene[] = [
  {
    id: "overview",
    component: AppOverviewScene,
    duration: 5,
    title: "The Complete Platform",
    subtitle: "For window treatment professionals",
  },
  {
    id: "team",
    component: TeamPermissionsScene,
    duration: 6,
    title: "Team Permissions",
    subtitle: "Control access for every role",
  },
  {
    id: "products",
    component: ProductBuilderScene,
    duration: 6,
    title: "Product Builder",
    subtitle: "Every treatment type supported",
  },
  {
    id: "themes",
    component: ThemeColorsScene,
    duration: 5,
    title: "Your Brand, Your Colors",
    subtitle: "Dark mode & custom themes",
  },
  {
    id: "pricing",
    component: MarkupPricingScene,
    duration: 5,
    title: "Smart Pricing",
    subtitle: "Automated margin calculations",
  },
  {
    id: "canvas",
    component: QuoteCanvasScene,
    duration: 8,
    title: "Quote Canvas",
    subtitle: "Design quotes visually",
  },
  {
    id: "integrations",
    component: IntegrationsScene,
    duration: 6,
    title: "Seamless Integrations",
    subtitle: "Connect your business ecosystem",
  },
  {
    id: "crm",
    component: CRMMessagingScene,
    duration: 6,
    title: "CRM & Messaging",
    subtitle: "Reach clients anywhere",
  },
  {
    id: "library",
    component: LibraryCalendarScene,
    duration: 5,
    title: "Library & Calendar",
    subtitle: "Everything organized",
  },
  {
    id: "finale",
    component: FinalMontageScene,
    duration: 8,
    title: "",
    subtitle: "",
  },
];

export const totalShowcaseDuration = showcaseScenes.reduce(
  (acc, scene) => acc + scene.duration,
  0
);
