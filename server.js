// ===========================
// EVENT BOOKING API SERVER
// ===========================

// Import required packages
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Event = require('./models/Event');  // Import Event model

// ===========================
// INITIALIZE EXPRESS APP
// ===========================
// Create an Express application instance
const app = express();

// Define the port where the server will run
const PORT = 3000;

// ===========================
// MIDDLEWARE SETUP
// ===========================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows requests from different domains to access our server
app.use(cors());

// Middleware to parse incoming JSON requests
// This allows us to handle requests with JSON data in the body
app.use(express.json());

// Middleware to parse URL-encoded data
// This allows us to handle form submissions
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Frontend folder
// This serves our HTML, CSS, and JavaScript files
app.use(express.static(path.join(__dirname, 'Frontend')));

// ===========================
// MONGODB CONNECTION
// ===========================
// MongoDB connection string
const MONGODB_URI = 'mongodb://127.0.0.1:27017/eventDB';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB Connection Successful!');
    console.log(`📊 Connected to database: eventDB`);
    console.log(`🗄️  Database URL: ${MONGODB_URI}`);
})
.catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Make sure MongoDB is running on localhost:27017');
});

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('🔴 MongoDB connection error:', error.message);
});

// ===========================
// ROUTES
// ===========================
// When user visits the root URL, serve the index.html from Frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// ===========================
// ROUTE: TEST API
// ===========================
// Test route to verify the server is running
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ Event Booking API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ===========================
// ROUTE: GET ALL EVENTS
// ===========================
// GET endpoint to retrieve all booked events from MongoDB
app.get('/api/events', async (req, res) => {
    try {
        // Query all events from MongoDB using the Event model
        const events = await Event.find();

        // Send success response with events
        res.json({
            success: true,
            count: events.length,
            data: events
        });

        console.log(`📊 Retrieved ${events.length} events from database`);

    } catch (error) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: 'Error retrieving events',
            error: error.message
        });

        console.error('❌ Error retrieving events:', error.message);
    }
});

// ===========================
// ROUTE: CREATE NEW EVENT
// ===========================
// POST endpoint to create a new booking in MongoDB
app.post('/api/events', async (req, res) => {
    try {
        // Extract data from request body
        const { name, eventType, date } = req.body;

        // Validate that all required fields are provided
        if (!name || !eventType || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, eventType, and date'
            });
        }

        // Create a new Event document using the model
        const newEvent = new Event({
            name: name,
            eventType: eventType,
            date: date
        });

        // Save the event to MongoDB
        const savedEvent = await newEvent.save();

        // Send success response with the created event
        res.status(201).json({
            success: true,
            message: 'Event booked successfully!',
            data: savedEvent
        });

        console.log('✅ New event booked:', savedEvent);

    } catch (error) {
        // Handle validation or other errors
        res.status(400).json({
            success: false,
            message: 'Error booking event',
            error: error.message
        });

        console.error('❌ Error booking event:', error.message);
    }
});

// ===========================
// ROUTE: DELETE AN EVENT
// ===========================
// DELETE endpoint to remove a booking by ID from MongoDB
app.delete('/api/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        // Find and delete the event from MongoDB using the model
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        // Check if event exists
        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Send success response
        res.json({
            success: true,
            message: 'Event cancelled successfully!',
            data: deletedEvent
        });

        console.log('❌ Event deleted:', deletedEvent);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });

        console.error('❌ Error deleting event:', error.message);
    }
});

// ===========================
// ROUTE: 404 NOT FOUND
// ===========================
// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Route not found',
        path: req.path
    });
});

// ===========================
// ERROR HANDLING MIDDLEWARE
// ===========================
// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// ===========================
// START THE SERVER
// ===========================
// Listen on the specified port
app.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   🎉 EVENT BOOKING API SERVER STARTED 🎉      ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  Server running on: http://localhost:${PORT}  ║`);
    console.log('║  Test API: http://localhost:3000/api/test     ║');
    console.log('║  Get Events: http://localhost:3000/api/events ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('\n');
});

// Handle server errors
process.on('error', (err) => {
    console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n📛 Server shutting down...\n');
    process.exit(0);
});
