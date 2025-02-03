import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Course } from '../types/course';
import { Enrollment } from '../types/enrollment';
import EventsModal from '@/app/components/EventsModal';
import { useState } from 'react';

interface CourseCalendarProps {
  enrolledCourses: Course[];
  className?: string;
}

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CourseCalendar({ enrolledCourses, className }: CourseCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  const events = enrolledCourses.map((course) => ({
    id: course._id,
    title: course.title,
    start: new Date(course.startDate),
    end: new Date(course.endDate),
    allDay: true,
    resource: course,
  }));

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleSelectSlot = (slotInfo: any) => {
    const eventsOnDate = events.filter(event => {
      const clickedDate = new Date(slotInfo.start);
      const courseStart = new Date(event.start);
      const courseEnd = new Date(event.end);
      
      // Reset time parts to compare dates only
      clickedDate.setHours(0, 0, 0, 0);
      courseStart.setHours(0, 0, 0, 0);
      courseEnd.setHours(0, 0, 0, 0);
      
      // Check if clicked date falls within course duration
      return clickedDate >= courseStart && clickedDate <= courseEnd;
    });
    
    setSelectedDate(slotInfo.start);
    setSelectedEvents(eventsOnDate);
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'agenda']}
        defaultView="month"
        onSelectSlot={handleSelectSlot}
        selectable
        onNavigate={(date) => {
          setSelectedDate(null);
          setSelectedEvents([]);
        }}
      />
      {selectedDate && (
        <EventsModal
          date={selectedDate}
          events={selectedEvents}
          onClose={() => {
            setSelectedDate(null);
            setSelectedEvents([]);
          }}
        />
      )}
    </div>
  );
}
