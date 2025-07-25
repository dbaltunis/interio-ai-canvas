
import CalendarView from "@/components/calendar/CalendarView";

interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab = ({ projectId }: CalendarTabProps) => {
  return (
    <div className="h-full">
      <CalendarView />
    </div>
  );
};
