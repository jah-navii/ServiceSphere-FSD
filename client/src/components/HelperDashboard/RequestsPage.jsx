import React, { useState } from 'react';
import styles from './RequestsPage.module.css';

// Mock data
const mockRequests = [
  { 
    id: 'req1', 
    service_type: 'Cleaning', 
    seeker: { name: 'Alice Smith' }, 
    date: '2025-12-10', 
    time: '10:00 AM', 
    address: '123 Main St, Apt 2B', 
    status: 'pending' 
  },
  { 
    id: 'req2', 
    service_type: 'Plumbing', 
    seeker: { name: 'Bob Johnson' }, 
    date: '2025-12-11', 
    time: '02:30 PM', 
    address: '456 Oak Ave', 
    status: 'Accepted' 
  },
  { 
    id: 'req3', 
    service_type: 'Painting', 
    seeker: { name: 'Charlie Brown' }, 
    date: '2025-12-12', 
    time: '09:00 AM', 
    address: '789 Pine Ln', 
    status: 'Rejected' 
  },
];

function RequestsPage() {
  const [requests, setRequests] = useState(mockRequests);

  const updateRequestStatus = async (requestId, newStatus) => {
    // Optimistic UI Update
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    console.log(`Updating request ${requestId} to ${newStatus}`);
  };

  return (
    <div className={styles.list}>
      {requests.length === 0 ? (
        <p className={styles.emptyMsg}>No service requests found.</p>
      ) : (
        requests.map(request => (
          <div className={styles.card} key={request.id}>
            <h3>{request.service_type} Service</h3>
            
            <p className={styles.infoRow}>
              <span className={styles.label}>Customer:</span> {request.seeker.name}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Date:</span> {request.date} at {request.time}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Address:</span> {request.address}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Status:</span> 
              <span className={styles.status} style={{
                  color: request.status === 'Accepted' ? 'green' : 
                         request.status === 'Rejected' ? 'red' : 'orange'
              }}>
                {request.status}
              </span>
            </p>
            
            {request.status === 'pending' && (
              <div className={styles.actions}>
                <button 
                  className={styles.acceptBtn} 
                  onClick={() => updateRequestStatus(request.id, 'Accepted')}
                >
                  Accept
                </button>
                <button 
                  className={styles.rejectBtn} 
                  onClick={() => updateRequestStatus(request.id, 'Rejected')}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default RequestsPage;