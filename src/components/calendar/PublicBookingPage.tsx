import { useParams } from "react-router-dom";
import { BookingConfirmation } from "./BookingConfirmation";

export const PublicBookingPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <BookingConfirmation slug="" />;
  }

  return <BookingConfirmation slug={slug} />;
};