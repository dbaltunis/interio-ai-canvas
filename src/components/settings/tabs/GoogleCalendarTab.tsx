
import { GoogleCalendarIntegrationTab } from "@/components/integrations/GoogleCalendarIntegrationTab";
import { useIntegrations } from "@/hooks/useIntegrations";

export const GoogleCalendarTab = () => {
  const { integrations } = useIntegrations();
  const googleCalendarIntegration = integrations.find(integration => integration.integration_type === 'google_calendar');

  return (
    <GoogleCalendarIntegrationTab integration={googleCalendarIntegration} />
  );
};
