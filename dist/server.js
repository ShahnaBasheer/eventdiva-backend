"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socketIo_1 = require("./config/socketIo");
// Load environment variables
dotenv_1.default.config();
// Connect to the database
(0, dbConnect_1.default)();
// Import routers
const customerRouter_1 = __importDefault(require("./routes/customerRouter"));
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
const vendorRouter_1 = __importDefault(require("./routes/vendorRouter"));
const eventPlannerRouter_1 = __importDefault(require("./routes/eventPlannerRouter"));
const venueVendorRouter_1 = __importDefault(require("./routes/venueVendorRouter"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Create the Express application
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.IO
(0, socketIo_1.initializeSocket)(server);
app.use((0, cors_1.default)({
    credentials: true,
    origin: ['http://localhost:4200',
        'https://master.d1ee9rxmukt8sl.amplifyapp.com',
        'https://www.eventdiva.online',
        'https://eventdiva.online'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));
// Middleware setup
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Routes setup
app.use('/', customerRouter_1.default);
app.use('/admin', adminRouter_1.default);
app.use('/vendor', vendorRouter_1.default);
app.use('/vendor/event-planner', eventPlannerRouter_1.default);
app.use('/vendor/venue-vendor', venueVendorRouter_1.default);
// Error handler
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});
exports.default = app;
