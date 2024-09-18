import dbConnect  from './config/dbConnect';
import http from 'http';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors'; 
import { initializeSocket } from './config/socketIo';


// Load environment variables
dotenv.config();
// Connect to the database
dbConnect();

// Import routers
import customerRouter from './routes/customerRouter';
import adminRouter from './routes/adminRouter';
import vendorRouter from './routes/vendorRouter';
import eventPlannerRouter from './routes/eventPlannerRouter';
import venueVendorRouter from './routes/venueVendorRouter';
import { errorHandler, notFoundHandler }  from './middlewares/errorHandler';


// Create the Express application
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

app.use(cors({
  credentials: true,
  origin: ['http://localhost:4200']
}));

// Middleware setup
app.use(cookieParser())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes setup
app.use('/', customerRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);
app.use('/vendor/event-planner', eventPlannerRouter);
app.use('/vendor/venue-vendor', venueVendorRouter);



// Error handler

app.use(notFoundHandler)
app.use(errorHandler)


// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

export default app;

