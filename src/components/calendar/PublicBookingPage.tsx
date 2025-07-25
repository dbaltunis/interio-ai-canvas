import { useParams } from "react-router-dom";
import { PublicBookingForm } from "../booking/PublicBookingForm";
import { Card } from "@/components/ui/card";

export const PublicBookingPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Booking Link</h1>
          <p className="text-muted-foreground">This booking link is not valid or has been removed.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <PublicBookingForm slug={slug} />
      </div>
    </div>
  );
};