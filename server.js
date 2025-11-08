// Import required modules
const express = require("express"); //Framework to build web applications
const cors = require("cors"); // Library that controls Cross-Origin Resource Sharing
const bodyParser = require("body-parser"); // parses the body of incoming HTTP requests

// Import routes
const housesRouter = require('./routes/houses.js');
// const peopleRouter = require('./routes/people');
// const purchasesRouter = require('./routes/purchases');
// const mealsRouter = require('./routes/meals');
// const itemsRouter = require('./routes/items');

// Create an Express application
// This is the main application object for handling HTTP requests and responses.
const app = express();

// Define the port for the server, defaulting to 3000 if not specified in the environment variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({extended: true})); // Parse URL-encoded bodies

// Middleware function logs the request method and path to the console
const logRequest = function(req, res, next) {
    console.log(`Request: ${req.method} for ${req.path}`);
    next();
};

app.use(logRequest);

// Root route
app.get("/", (req, res) => {
    res.json({
      message: "Bill Tracker API",
      version: "1.0.0",
      endpoints: {
        houses: "/api/houses",
        // people: '/api/people',
        // purchases: '/api/purchases',
        // meals: '/api/meals',
        // items: '/api/items'
      },
    });
});

//API routes
app.use('/api/houses', housesRouter);
// app.use('/api/people', peopleRouter);
// app.use('/api/purchases', purchasesRouter);
// app.use('/api/meals', mealsRouter);
// app.use('/api/items', itemsRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
  
// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`
        Bill Tracker API
        Server running on http://localhost:${PORT}
        `)
});

// Shutting down
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});