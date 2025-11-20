interface CalendarTabProps {
  projectId: string;
}

export const CalendarTab = ({ projectId }: CalendarTabProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-muted-foreground">Calendar view removed</p>
    </div>
  );
};
