import React, { useState } from 'react';

// Mock data to simulate fetching requests from a backend API
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
  // State to hold the list of service requests
  const [requests, setRequests] = useState(mockRequests);

  // Function to handle status updates (Accept/Reject)
  const updateRequestStatus = async (requestId, newStatus) => {
    // 1. Optimistic UI Update: Update the local state first
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    // 2. API Call (Simulated)
    console.log(`Sending API request to update request ${requestId} to ${newStatus}`);
    
    // In a real application, you would make a fetch/axios call here:
    /*
    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status on server.');
      }
      // If successful, the local state change is kept.
    } catch (error) {
      console.error(error);
      // Revert state if the API call fails (Rollback)
      // For simplicity, we skip rollback here, but it's crucial for production apps.
    }
    */
  };


  return (
    <div id="requests-list">
      {requests.length === 0 ? (
        <p>No service requests found.</p>
      ) : (
        requests.map(request => (
          <div className="request-card" data-request-id={request.id} key={request.id}>
            <h3>{request.service_type} Service</h3>
            <p>
              <strong>Customer:</strong> {request.seeker.name}
            </p>
            <p>
              <strong>Date:</strong> {request.date} at {request.time}
            </p>
            <p>
              <strong>Address:</strong> {request.address}
            </p>
            <p>
              <strong>Status:</strong> <span id={`status-${request.id}`}>{request.status}</span>
            </p>
            
            {/* Conditional rendering for pending requests */}
            {request.status === 'pending' ? (
              <>
                <button onClick={() => updateRequestStatus(request.id, 'Accepted')}>
                  Accept
                </button>
                <button onClick={() => updateRequestStatus(request.id, 'Rejected')}>
                  Reject 
                </button>
              </>
            ) : (
              <p>
                <em>Request {request.status}</em>
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default RequestsPage;