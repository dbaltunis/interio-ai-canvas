
import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";

interface Event {
  title: string;
  start: string;
  end: string;
  type: string;
  backgroundColor: string;
  location: string;
  description: string;
  extendedProps: {
    type: string;
    appointment_type?: string;
    customer?: string;
    email?: string;
    phone?: string;
  };
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'consultation':
      return '#3b82f6'; // Blue
    case 'installation':
      return '#10b981'; // Green
    case 'site_survey':
      return '#eab308'; // Yellow
    case 'booked':
      return '#6d28d9'; // Purple
    default:
      return '#9ca3af'; // Gray
  }
};

export const GoogleCalendarView = () => {
  const { data: appointments } = useAppointments();
  const { data: scheduledAppointments } = useAppointmentBookings();

  const calendarEvents = useMemo(() => {
    const events = [];
    
    // Add appointments (from appointments table)
    if (appointments) {
      events.push(...appointments.map(appointment => ({
        title: appointment.title,
        start: appointment.start_time,
        end: appointment.end_time,
        type: appointment.appointment_type || 'appointment',
        backgroundColor: getEventColor(appointment.appointment_type || 'appointment'),
        location: appointment.location,
        description: appointment.description,
        extendedProps: {
          type: 'appointment',
          appointment_type: appointment.appointment_type
        }
      })));
    }

    // Add booked appointments (from appointments_booked table)
    if (scheduledAppointments) {
      events.push(...scheduledAppointments
        .filter(booking => booking.status === 'confirmed') // Only show confirmed bookings
        .map(booking => ({
          title: `${booking.customer_name} - Appointment`,
          start: `${booking.appointment_date}T${booking.appointment_time}`,
          end: `${booking.appointment_date}T${booking.appointment_time}`, // Will be calculated based on duration
          type: 'booked',
          backgroundColor: getEventColor('booked'),
          location: booking.location_type,
          description: booking.booking_message || booking.notes,
          extendedProps: {
            type: 'booked',
            customer: booking.customer_name,
            email: booking.customer_email,
            phone: booking.customer_phone
          }
        })));
    }

    return events;
  }, [appointments, scheduledAppointments]);

  const handleDateSelect = (selectInfo: any) => {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
    }
  }

  const handleEventClick = (clickInfo: any) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove()
    }
  }

  const handleEvents = (events: any) => {
    //setCurrentEvents(events)
  }

  return (
    <div className='demo-app'>
      <div className='demo-app-main'>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          initialEvents={calendarEvents} // alternatively, use the `events` setting to fetch from a feed
          select={handleDateSelect}
          eventContent={renderEventContent} // custom render function
          eventClick={handleEventClick}
          eventsSet={handleEvents} // update `currentEvents` state when a change is made
          /*
            you can update a remote database when these fire:
            eventAdd={function(){}}
            eventChange={function(){}}
            eventRemove={function(){}}
            */
        />
      </div>
    </div>
  )
}

function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <span>{eventInfo.event.title}</span>
    </>
  )
}
