// ===========================
// API CONFIGURATION
// ===========================
// Backend API base URL
const API_URL = 'http://localhost:3000/api';

// ===========================
// PAGE LOAD - FETCH EVENTS FROM BACKEND
// ===========================
// When the page loads, fetch all events from MongoDB
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page loaded. Fetching events from backend...');
    fetchEventsFromBackend();
});

// ===========================
// FORM SUBMISSION HANDLER
// ===========================
// Get the form element
const eventForm = document.getElementById('eventForm');

// Add event listener for form submission
eventForm.addEventListener('submit', function(e) {
    // Prevent the page from reloading
    e.preventDefault();

    // Get form input values
    const name = document.getElementById('name').value.trim();
    const eventType = document.getElementById('eventType').value;
    const date = document.getElementById('date').value;

    // Validate that all fields are filled
    if (!name || !eventType || !date) {
        alert('Please fill in all fields');
        return;
    }

    // Create event object to send to backend
    const eventData = {
        name: name,
        eventType: eventType,
        date: date
    };

    // Send booking data to backend using POST request
    sendEventToBackend(eventData);

    // Clear the form inputs
    eventForm.reset();

    // Focus back to name input for next entry
    document.getElementById('name').focus();
});

// ===========================
// SEND EVENT TO BACKEND (POST REQUEST)
// ===========================
function sendEventToBackend(eventData) {
    console.log('📤 Sending event to backend...', eventData);

    // Fetch API - POST request to /api/events
    fetch(`${API_URL}/events`, {
        method: 'POST',                           // HTTP POST method
        headers: {
            'Content-Type': 'application/json'    // Tell server we're sending JSON
        },
        body: JSON.stringify(eventData)            // Convert object to JSON string
    })
    .then(response => {
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse response as JSON
        return response.json();
    })
    .then(data => {
        // Success! Event was saved to database
        console.log('✅ Event booked successfully:', data);
        
        // Show success message to user
        alert('✅ Event booked successfully!');
        
        // Refresh the list to show the new event
        fetchEventsFromBackend();
    })
    .catch(error => {
        // Handle errors
        console.error('❌ Error booking event:', error);
        alert('❌ Error booking event. Please try again.');
    });
}

// ===========================
// FETCH EVENTS FROM BACKEND (GET REQUEST)
// ===========================
function fetchEventsFromBackend() {
    console.log('🔄 Fetching events from backend...');

    // Fetch API - GET request to /api/events
    fetch(`${API_URL}/events`)
    .then(response => {
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse response as JSON
        return response.json();
    })
    .then(data => {
        // Success! Got events from database
        console.log('📊 Events fetched from backend:', data);
        
        // Display the events on the page
        displayEvents(data.data);
    })
    .catch(error => {
        // Handle errors
        console.error('❌ Error fetching events:', error);
        displayEvents([]);  // Show empty list
    });
}

// ===========================
// DISPLAY ALL BOOKED EVENTS
// ===========================
function displayEvents(eventsFromBackend) {
    // Get the container where events will be displayed
    const eventsList = document.getElementById('eventsList');

    // If no events exist, show empty message
    if (!eventsFromBackend || eventsFromBackend.length === 0) {
        eventsList.innerHTML = `
            <p class="empty-message">
                📅 No events booked yet. Book your first event above!
            </p>
        `;
        return;
    }

    console.log(`📋 Displaying ${eventsFromBackend.length} events`);

    // Clear previous content
    eventsList.innerHTML = '';

    // Loop through each event and create a card
    eventsFromBackend.forEach(function(event) {
        // Create a div for the event card
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        // Format the date in a readable format
        // The date from backend might be a string, so we parse it
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Set the HTML content for the event card
        // Note: event._id is the MongoDB ID, not event.id
        eventCard.innerHTML = `
            <div class="event-info">
                <p><strong>Name</strong> ${event.name}</p>
                <p><strong>Event Type</strong> ${event.eventType}</p>
                <p><strong>Date</strong> ${formattedDate}</p>
            </div>
            <button class="delete-btn" onclick="deleteEventFromBackend('${event._id}')">
                Delete
            </button>
        `;

        // Add the event card to the container
        eventsList.appendChild(eventCard);
    });
}

// ===========================
// DELETE EVENT FROM BACKEND (DELETE REQUEST)
// ===========================
function deleteEventFromBackend(eventId) {
    // Confirm before deleting
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;  // User cancelled, do nothing
    }

    console.log('🗑️  Deleting event with ID:', eventId);

    // Fetch API - DELETE request to /api/events/:id
    fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE'  // HTTP DELETE method
    })
    .then(response => {
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse response as JSON
        return response.json();
    })
    .then(data => {
        // Success! Event was deleted from database
        console.log('❌ Event deleted successfully:', data);
        
        // Show success message to user
        alert('✅ Event cancelled successfully!');
        
        // Refresh the list to remove the deleted event
        fetchEventsFromBackend();
    })
    .catch(error => {
        // Handle errors
        console.error('❌ Error deleting event:', error);
        alert('❌ Error deleting event. Please try again.');
    });
}

// ===========================
// OPTIONAL: CLEAR ALL EVENTS
// ===========================
function clearAllEvents() {
    if (confirm('Are you sure you want to clear all bookings?')) {
        // This would require a special endpoint on the backend
        // For now, we'll just log a message
        console.log('Clear all functionality not yet implemented');
    }
}
