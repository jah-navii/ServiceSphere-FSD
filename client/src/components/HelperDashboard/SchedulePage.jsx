import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// --- Mock Data simulating backend API response ---
// This simulates the data passed via the EJS script tag
const mockBlockedDates = [
  "2025-12-15", // Example of a fully blocked day
  "2025-12-25", // Christmas
];
// Helper to transform blocked dates into FullCalendar events
const getCalendarEvents = (blockedDates) => {
  // Assuming the blockedDates array contains strings in 'YYYY-MM-DD' format
  return blockedDates.map((date) => ({
    title: "Unavailable",
    start: date,
    allDay: true,
    // Add a custom class for styling blocked days (defined in helperDashboard.css)
    classNames: ["unavailable"],
  }));
};
// ------------------------------------------------

function SchedulePage() {
  const [blockedDates, setBlockedDates] = useState(mockBlockedDates);
  const calendarRef = useRef(null);
  // In a real application, you would fetch this data on component mount
  useEffect(() => {
    // Simulated API call to fetch blocked dates
    // fetch('/api/helper/blocked-dates')
    //   .then(res => res.json())
    //   .then(data => setBlockedDates(data));
  }, []);
  // Prepare events for the calendar
  const events = getCalendarEvents(blockedDates);
  // Optional: Function to handle when a user clicks on a day (e.g., to block/unblock it)
  const handleDateClick = (info) => {
    alert(`Date clicked: ${info.dateStr}`);
    // Logic here to update blockedDates state and send an API request
  };

  return (
    <div className="content">
      <h2>Your Schedule</h2>
      <div id="availability-calendar">
        {/* FullCalendar Component */}
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
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          className="availability-calendar"
        />
      </div>
    </div>
  );
}

export default SchedulePage;
