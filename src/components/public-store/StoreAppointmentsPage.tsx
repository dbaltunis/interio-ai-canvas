import { StoreAppointments } from "./StoreAppointments";

interface StoreAppointmentsPageProps {
  storeData: any;
}

export const StoreAppointmentsPage = ({ storeData }: StoreAppointmentsPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <StoreAppointments
        storeId={storeData.id}
        content={{
          heading: "Schedule Your Appointment",
          description: "Choose a convenient time to discuss your window treatment needs with our experts"
        }}
      />
    </div>
  );
};
