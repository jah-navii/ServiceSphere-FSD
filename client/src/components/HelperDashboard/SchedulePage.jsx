import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./SchedulePage.module.css";

const mockBlockedDates = ["2025-12-15", "2025-12-25"];

const getCalendarEvents = (blockedDates) => {
  return blockedDates.map((date) => ({
    title: "Unavailable",
    start: date,
    allDay: true,
    classNames: ["unavailable"], // Matches :global(.unavailable) in CSS
  }));
};

function SchedulePage() {
  const [blockedDates, setBlockedDates] = useState(mockBlockedDates);
  const calendarRef = useRef(null);

  const events = getCalendarEvents(blockedDates);

  const handleDateClick = (info) => {
    // Ideally, toggle availability logic here
    alert(`Date clicked: ${info.dateStr}`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Schedule</h2>
      
      <div className={styles.calendarWrapper}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          dateClick={handleDateClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          height="auto"
        />
      </div>
    </div>
  );
}

export default SchedulePage;