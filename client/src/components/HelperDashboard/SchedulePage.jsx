import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { helperApi } from '../../utils/helperApi';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./SchedulePage.module.css";

function SchedulePage() {
  const { userData } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  // Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!helperId) return;

      try {
        const data = await helperApi.schedule(helperId);
        setEvents(data);
      } catch (err) {
        console.error("Failed to load schedule:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [helperId]);

  // Handle clicking an event - Show modal with details
  const handleEventClick = (info) => {
    const { title, extendedProps } = info.event;
    setSelectedEvent({
      title,
      ...extendedProps
    });
  };

  // Close modal
  const closeModal = () => {
    setSelectedEvent(null);
  };

  // Custom day cell content - show count of appointments
  const renderDayCellContent = (arg) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start).toDateString();
      const cellDate = arg.date.toDateString();
      return eventDate === cellDate;
    });

    return (
      <div className={styles.dayCell}>
        <div className={styles.dayNumber}>{arg.dayNumberText}</div>
        {dayEvents.length > 0 && (
          <div className={styles.eventCount}>
            {dayEvents.length} {dayEvents.length === 1 ? 'appointment' : 'appointments'}
          </div>
        )}
      </div>
    );
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
          dayCellContent={renderDayCellContent}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventContent={(eventInfo) => {
            return (
              <div className={styles.eventContent}>
                <div className={styles.eventTime}>
                  {eventInfo.timeText}
                </div>
                <div className={styles.eventTitle}>
                  {eventInfo.event.title}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button className={styles.closeButton} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Service:</span>
                <span className={styles.detailValue}>{selectedEvent.serviceType}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Customer:</span>
                <span className={styles.detailValue}>{selectedEvent.customerName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>{selectedEvent.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time:</span>
                <span className={styles.detailValue}>{selectedEvent.time}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Address:</span>
                <span className={styles.detailValue}>{selectedEvent.address}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Price:</span>
                <span className={styles.detailValue}>₹{selectedEvent.price}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;