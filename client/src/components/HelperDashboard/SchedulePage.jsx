import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./SchedulePage.module.css";

function SchedulePage() {
  const { userData } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!helperId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/helper/schedule/${helperId}`);
        const data = await res.json();

        if (res.ok) {
          console.log('Schedule received: ' + data)
          setEvents(data); // Data is already formatted for FullCalendar by backend
        } else {
          console.log("No data")
          console.error("Failed to load schedule");
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [helperId]);

  // Handle clicking an event (Optional: Show details)
  const handleEventClick = (info) => {
    const { title, extendedProps } = info.event;
    alert(`${title}\nAddress: ${extendedProps.address}\nPrice: ₹${extendedProps.price}`);
  };

  if (loading) return <p style={{padding:'20px'}}>Loading schedule...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Schedule</h2>
      
      <div className={styles.calendarWrapper}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          // Make events look distinct
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>
    </div>
  );
}

export default SchedulePage;